export default function CadastroPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-fundo p-6 text-center">
      <span className="font-titulo text-[28px] text-bordo">
        Integrative Equus
      </span>
      <h1 className="font-titulo text-2xl text-texto">Cadastro</h1>
      <p className="max-w-sm text-sm text-texto-secundario">
        Esta página será usada para o cliente preencher os próprios dados e os
        animais, a partir do link enviado pela clínica.
      </p>
    </div>
  );
}
