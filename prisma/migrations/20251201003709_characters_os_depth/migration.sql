-- CreateTable
CREATE TABLE "CharacterArc" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "season" INTEGER,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "startState" TEXT,
    "endState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterArc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterArcBeat" (
    "id" TEXT NOT NULL,
    "arcId" TEXT NOT NULL,
    "sceneId" TEXT,
    "description" TEXT NOT NULL,
    "type" TEXT,
    "index" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterArcBeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterFact" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "knownByIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterRelationship" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "dynamic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterArc_characterId_idx" ON "CharacterArc"("characterId");

-- CreateIndex
CREATE INDEX "CharacterArcBeat_arcId_idx" ON "CharacterArcBeat"("arcId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterArcBeat_arcId_index_key" ON "CharacterArcBeat"("arcId", "index");

-- CreateIndex
CREATE INDEX "CharacterFact_characterId_idx" ON "CharacterFact"("characterId");

-- CreateIndex
CREATE INDEX "CharacterRelationship_fromId_idx" ON "CharacterRelationship"("fromId");

-- CreateIndex
CREATE INDEX "CharacterRelationship_toId_idx" ON "CharacterRelationship"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterRelationship_fromId_toId_key" ON "CharacterRelationship"("fromId", "toId");

-- AddForeignKey
ALTER TABLE "CharacterArc" ADD CONSTRAINT "CharacterArc_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterArcBeat" ADD CONSTRAINT "CharacterArcBeat_arcId_fkey" FOREIGN KEY ("arcId") REFERENCES "CharacterArc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterArcBeat" ADD CONSTRAINT "CharacterArcBeat_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFact" ADD CONSTRAINT "CharacterFact_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelationship" ADD CONSTRAINT "CharacterRelationship_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelationship" ADD CONSTRAINT "CharacterRelationship_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
