import Image from "next/image";
import Link from "next/link";

export function WhyInvestSection() {
  return (
    <section className="w-full bg-white py-16">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <figure className="wp-block-uagb-image__figure">
              <Image
                src="/images/emoji-card.jpg"
                alt="Disposicao Da Vista Superior Com Um Cartao Emoji Sorridente"
                width={484}
                height={500}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </figure>
          </div>
          <div>
            <div className="uagb-infobox-margin-wrapper">
              <div className="uagb-ifb-content">
                <span className="block font-sans text-base font-medium text-foreground uppercase mb-5">
                  &nbsp;
                </span>
                <h2 className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize mb-5">
                  Porquê investir em felicidade organizacional?
                </h2>
                <p className="font-sans text-base font-medium leading-[26.4px] text-foreground mb-8">
                  Num mundo em constante mudança, onde a produtividade depende
                  cada vez mais da motivação e do bem-estar das pessoas, as
                  organizações enfrentam um desafio decisivo: criar ambientes que
                  inspirem, valorizem e cuidem dos seus colaboradores.
                  <br />
                  Não se trata apenas de melhorar o clima interno. Estudos
                  internacionais demonstram que empresas que investem em
                  felicidade organizacional{" "}
                  <strong>reduzem o absentismo</strong>,{" "}
                  <strong>aumentam a retenção</strong> de talento e conquistam{" "}
                  <strong>resultados financeiros superiores</strong>. Em
                  Portugal, os dados revelam que ainda há um longo caminho a
                  percorrer — e é precisamente aqui que surge a oportunidade de
                  transformar a cultura empresarial.
                  <br />
                  Antes de olhar para os números, é importante compreender que
                  cada percentagem representa mais do que estatística:
                  representa pessoas, equipas e o futuro das organizações.
                </p>
                <div>
                  <Link
                    href="/sobre"
                    className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
                  >
                    Saber Mais
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
