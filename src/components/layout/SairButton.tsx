import { sair } from "@/app/login/actions";
import { Button } from "@/components/ui";

export function SairButton() {
  return (
    <form action={sair}>
      <Button type="submit" variante="neutro" className="min-h-9 px-3 text-xs">
        Sair
      </Button>
    </form>
  );
}
