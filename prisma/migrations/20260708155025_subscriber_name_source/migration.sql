-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'newsletter';
