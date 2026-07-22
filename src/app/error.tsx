"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <Image
          src="/images/logo.png"
          alt="HumanUp"
          width={120}
          height={40}
          className="mx-auto"
        />
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Algo correu mal
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          Ocorreu um erro inesperado. A equipa HumanUp foi notificada.
        </p>
        {error.digest && (
          <p className="font-body-sm text-body-sm text-tertiary">
            Código de erro: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-button text-button hover:opacity-90 transition-opacity cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
