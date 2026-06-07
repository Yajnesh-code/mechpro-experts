import { redirect } from "next/navigation";

type AuthResetPasswordAliasPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function AuthResetPasswordAliasPage({ searchParams }: AuthResetPasswordAliasPageProps) {
  const params = await searchParams;
  const token = params.token ? `?token=${encodeURIComponent(params.token)}` : "";
  redirect(`/reset-password${token}`);
}

