import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { EmagDownloadButton } from "@/components/emag/EmagDownloadButton";

type EmagIssue = {
  title: string;
  slug: string;
  content: string; // HTML paragraphs migrated from the original homepage
  coverImage: string | null;
  downloadUrl: string | null;
};

export function EmagSection({ issue }: { issue: EmagIssue | null }) {
  if (!issue) return null;
  return (
    <Section tone="kelp" eyebrow="Khanatural e-Mag" title={issue.title.replace(/^Khanatural e-Mag — /, "")} align="left" id="emag">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <div
            className="space-y-4 text-base leading-relaxed text-sand-200/90 [&_p]:m-0"
            dangerouslySetInnerHTML={{ __html: issue.content }}
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href={issue.downloadUrl ? `/media/emag/${issue.slug}/` : "/media/"} variant="gold" size="lg">
              Read the eMag
            </ButtonLink>
            {issue.downloadUrl && (
              <EmagDownloadButton pdfUrl={issue.downloadUrl} issueTitle={issue.title} variant="outlineLight" />
            )}
            <ButtonLink
              href="/media/"
              variant="outline"
              size="lg"
              className="border-sand-200/60 text-sand-50 hover:bg-sand-50 hover:text-kelp-950"
            >
              Past issues
            </ButtonLink>
          </div>
        </div>
        {issue.coverImage && (
          <div className="relative mx-auto w-full max-w-sm lg:max-w-[28rem]">
            <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-gold-500/15 blur-xl" />
            <Image
              src={issue.coverImage}
              alt={`${issue.title} cover`}
              width={480}
              height={680}
              sizes="(max-width: 1024px) 90vw, 448px"
              className="relative w-full rounded-3xl shadow-2xl shadow-kelp-950/50"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
