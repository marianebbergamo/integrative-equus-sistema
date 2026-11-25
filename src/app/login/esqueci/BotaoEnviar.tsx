"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

export function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-1 w-full" disabled={pending}>
      {pending ? "Enviando…" : "Enviar link"}
    </Button>
  );
}
