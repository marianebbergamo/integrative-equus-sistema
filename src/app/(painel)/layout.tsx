import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("perfil")
    .eq("id", data.user.id)
    .maybeSingle();

  return (
    <AppShell
      emailUsuario={data.user.email ?? ""}
      ehAdministrador={usuario?.perfil === "administrador"}
    >
      {children}
    </AppShell>
  );
}
