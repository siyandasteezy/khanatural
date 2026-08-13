/**
 * Set an admin password deliberately.
 *
 * The seed only ever creates the admin account and never rewrites its password
 * — otherwise re-seeding content against production would silently reset the
 * live credentials. Rotation is this script's job, and nothing else's.
 *
 *   npm run admin:password -- --email sales@khanatural.com --password '<new>'
 *
 * Against production, prefix it with that database's URL:
 *
 *   DATABASE_URL="<neon url>" npm run admin:password -- --password '<new>'
 *
 * Omit --password and one is generated and printed.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main() {
  const email = arg("email") ?? process.env.ADMIN_EMAIL ?? "sales@khanatural.com";
  const generated = !arg("password");
  // url-safe, no shell-hostile characters
  const password = arg("password") ?? `Kha-${randomBytes(15).toString("base64url")}`;

  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    console.error(`No user with email ${email}. Run \`npm run db:seed\` to create the admin first.`);
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  const host = (process.env.DATABASE_URL ?? "").match(/@([^/:]+)/)?.[1] ?? "unknown host";
  console.log(`Password updated for ${email}`);
  console.log(`  database: ${host}`);
  if (generated) console.log(`  password: ${password}`);
  console.log("\nSign in at /admin/login/");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
