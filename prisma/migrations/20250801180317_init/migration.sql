-- CreateTable
CREATE TABLE "public"."Currency" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency_value_key" ON "public"."Currency"("value");
