import "server-only";

import { ReimbursementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type {
  ReimbursementListParams,
  ReimbursementMutationInput,
} from "@/modules/reimbursement/types";

export type ReimbursementDatabaseClient = Pick<
  typeof prisma,
  | "reimbursement"
  | "reimbursementItem"
  | "reimbursementCategory"
  | "workflowHistory"
>;

const reimbursementInclude = {
  requester: {
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      department: {
        select: {
          name: true,
        },
      },
    },
  },
  items: {
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  attachments: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  workflowHistories: {
    include: {
      performedBy: {
        select: {
          id: true,
          fullName: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
};

function createMyReimbursementWhere({
  requesterId,
  search,
  status,
}: Pick<ReimbursementListParams, "requesterId" | "search" | "status">) {
  return {
    requesterId,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { number: { contains: search, mode: "insensitive" as const } },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              items: {
                some: {
                  description: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };
}

export async function countMyReimbursements(params: ReimbursementListParams) {
  return prisma.reimbursement.count({
    where: createMyReimbursementWhere(params),
  });
}

export async function findMyReimbursements(params: ReimbursementListParams) {
  return prisma.reimbursement.findMany({
    where: createMyReimbursementWhere(params),
    include: {
      items: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip: (params.pagination.page - 1) * params.pagination.pageSize,
    take: params.pagination.pageSize,
  });
}

export async function findReimbursementById(id: string) {
  return prisma.reimbursement.findUnique({
    where: { id },
    include: reimbursementInclude,
  });
}

export async function findOwnedReimbursementById(
  id: string,
  requesterId: string,
  tx: ReimbursementDatabaseClient = prisma,
) {
  return tx.reimbursement.findFirst({
    where: {
      id,
      requesterId,
    },
    include: reimbursementInclude,
  });
}

export async function findActiveCategories() {
  return prisma.reimbursementCategory.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ name: "asc" }, { code: "asc" }],
  });
}

export async function findActiveCategoryIds(categoryIds: string[]) {
  return prisma.reimbursementCategory.findMany({
    where: {
      id: {
        in: categoryIds,
      },
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
    },
  });
}

export async function createDraftReimbursement(
  requesterId: string,
  draftNumber: string,
  totalAmount: string,
  input: ReimbursementMutationInput,
) {
  return prisma.$transaction(async (tx) => {
    const reimbursement = await tx.reimbursement.create({
      data: {
        requesterId,
        number: draftNumber,
        description: input.description ?? null,
        status: ReimbursementStatus.DRAFT,
        totalAmount,
        items: {
          create: input.items.map((item) => ({
            categoryId: item.categoryId,
            description: item.description,
            amount: item.amount,
          })),
        },
        workflowHistories: {
          create: {
            action: "CREATE",
            toStatus: ReimbursementStatus.DRAFT,
            performedById: requesterId,
          },
        },
      },
    });

    return findOwnedReimbursementById(reimbursement.id, requesterId, tx);
  });
}

export async function replaceDraftReimbursementItems(
  id: string,
  requesterId: string,
  totalAmount: string,
  input: ReimbursementMutationInput,
) {
  return prisma.$transaction(async (tx) => {
    await tx.reimbursementItem.deleteMany({
      where: {
        reimbursementId: id,
      },
    });

    await tx.reimbursement.update({
      where: { id },
      data: {
        description: input.description ?? null,
        totalAmount,
        items: {
          create: input.items.map((item) => ({
            categoryId: item.categoryId,
            description: item.description,
            amount: item.amount,
          })),
        },
      },
    });

    return findOwnedReimbursementById(id, requesterId, tx);
  });
}

export async function deleteDraftReimbursement(id: string) {
  await prisma.reimbursement.delete({
    where: { id },
  });
}

export async function findLatestOfficialNumberByPrefix(
  prefix: string,
  tx: ReimbursementDatabaseClient = prisma,
) {
  return tx.reimbursement.findFirst({
    where: {
      number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      number: "desc",
    },
    select: {
      number: true,
    },
  });
}

export async function submitDraftReimbursement(
  id: string,
  requesterId: string,
  fromStatus: ReimbursementStatus,
  toStatus: ReimbursementStatus,
  submittedAt: Date,
  generateNumber?: (tx: ReimbursementDatabaseClient) => Promise<string>,
) {
  return prisma.$transaction(async (tx) => {
    const officialNumber = generateNumber ? await generateNumber(tx) : null;
    const reimbursement = await tx.reimbursement.update({
      where: { id },
      data: {
        ...(officialNumber ? { number: officialNumber } : {}),
        status: toStatus,
        submittedAt,
        workflowHistories: {
          create: {
            action: "SUBMIT",
            fromStatus,
            toStatus,
            performedById: requesterId,
          },
        },
      },
    });

    return findOwnedReimbursementById(reimbursement.id, requesterId, tx);
  });
}
