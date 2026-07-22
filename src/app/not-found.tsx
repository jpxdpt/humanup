import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <img
          src="/images/logo-full.svg"
          alt="HumanUp"
          width={120}
          height={40}
          className="mx-auto"
        />
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Página não encontrada
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          A página que procuras não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-button text-button hover:opacity-90 transition-opacity"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
