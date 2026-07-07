import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, verifyCredentials, createSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const session = await verifyCredentials(email, password);
  if (!session) redirect("/admin/login/?error=1");
  await createSession(session);
  redirect("/admin/");
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getSession();
  if (session) redirect("/admin/");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm ring-1 ring-sand-200">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">Admin login</h1>
        <p className="mt-1 text-sm text-ink/60">Khanatural dashboard</p>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Invalid email or password.
          </p>
        )}
        <form action={login} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" name="email" type="email" required autoComplete="username" />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
