import type { NextRequest } from "next/server";

import {
  apiPaginated,
  parsePagination,
  validateSearchParams,
} from "@/lib/api";
import { withApiPermission } from "@/lib/auth/route-handlers";
import {
  listPermissions,
  permissionListQuerySchema,
} from "@/modules/master-data/permissions";

export const GET = withApiPermission(
  "master.role",
  async (request: NextRequest) => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const query = validateSearchParams(
      request.nextUrl.searchParams,
      permissionListQuerySchema,
    );
    const result = await listPermissions({
      search: query.search,
      pagination,
    });

    return apiPaginated(result.data, result.meta);
  },
);
