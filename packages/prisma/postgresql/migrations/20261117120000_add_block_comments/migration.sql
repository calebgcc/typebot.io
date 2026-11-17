-- CreateTable
CREATE TABLE "BlockCommentThread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typebotId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "BlockCommentThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockComment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "BlockComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlockCommentThread_typebotId_idx" ON "BlockCommentThread"("typebotId");

-- CreateIndex
CREATE INDEX "BlockComment_threadId_idx" ON "BlockComment"("threadId");

-- CreateIndex
CREATE INDEX "BlockComment_authorId_idx" ON "BlockComment"("authorId");

-- AddForeignKey
ALTER TABLE "BlockCommentThread" ADD CONSTRAINT "BlockCommentThread_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockComment" ADD CONSTRAINT "BlockComment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "BlockCommentThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockComment" ADD CONSTRAINT "BlockComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
