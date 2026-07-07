import Image from "next/image";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { AdminCard, AdminTitle } from "@/components/admin/ui";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

async function listImages(): Promise<{ folder: string; files: string[] }[]> {
  const root = join(process.cwd(), "public", "images");
  const folders = await readdir(root, { withFileTypes: true });
  const result: { folder: string; files: string[] }[] = [];
  for (const f of folders) {
    if (!f.isDirectory()) continue;
    const files = (await readdir(join(root, f.name))).filter((n) => IMAGE_EXTENSIONS.test(n)).sort();
    result.push({ folder: f.name, files });
  }
  return result;
}

export default async function AdminMediaPage() {
  const groups = await listImages();

  return (
    <>
      <AdminTitle title="Media library" />
      <AdminCard className="mb-6">
        <p className="text-sm text-ink/70">
          All images migrated from khanatural.com live in <code className="rounded bg-sand-100 px-1.5 py-0.5">public/images/</code>.
          Reference them by path (e.g. <code className="rounded bg-sand-100 px-1.5 py-0.5">/images/brand/logo.png</code>) in
          products and articles. Add new files to the same folders in the repository.
        </p>
      </AdminCard>
      {groups.map((g) => (
        <section key={g.folder} className="mb-10">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">
            {g.folder} <span className="text-sm font-normal text-ink/50">({g.files.length})</span>
          </h2>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {g.files.map((file) => {
              const url = `/images/${g.folder}/${file}`;
              return (
                <li key={url} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-sand-200">
                    <Image src={url} alt={file} fill sizes="150px" className="object-cover" />
                  </div>
                  <p className="mt-1.5 truncate text-[11px] text-ink/50" title={url}>
                    {file}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
