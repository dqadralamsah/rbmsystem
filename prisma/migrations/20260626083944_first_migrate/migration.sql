-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'PENDING_ATASAN', 'PENDING_FINANCE', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('SUBMIT', 'APPROVE', 'REJECT');

-- CreateTable
CREATE TABLE "reimbursement_requests" (
    "id" VARCHAR(20) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "user_name" VARCHAR(100) NOT NULL,
    "approver_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "total_amount" BIGINT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reimbursement_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement_items" (
    "id" SERIAL NOT NULL,
    "request_id" VARCHAR(20) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "amount" BIGINT NOT NULL,
    "description" TEXT,

    CONSTRAINT "reimbursement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement_attachments" (
    "id" SERIAL NOT NULL,
    "request_id" VARCHAR(20) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,

    CONSTRAINT "reimbursement_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement_histories" (
    "id" SERIAL NOT NULL,
    "request_id" VARCHAR(20) NOT NULL,
    "actor_id" VARCHAR(50) NOT NULL,
    "actor_name" VARCHAR(100) NOT NULL,
    "action" "ActionType" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reimbursement_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reimbursement_items" ADD CONSTRAINT "reimbursement_items_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "reimbursement_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_attachments" ADD CONSTRAINT "reimbursement_attachments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "reimbursement_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_histories" ADD CONSTRAINT "reimbursement_histories_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "reimbursement_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
