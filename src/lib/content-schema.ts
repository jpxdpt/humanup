import type { NavItem, ServiceSlide } from "@/types";

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface PackageFeature {
  text: string;
}

export interface PackageItem {
  name: string;
  popular: boolean;
  features: PackageFeature[];
  cta: string;
  ctaHref: string;
}

export interface MethodStep {
  number: string;
  title: string;
  description: string;
}

export interface TextBlock {
  title: string;
  body: string;
}

export interface CtaBlock {
  title: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface SiteContent {
  header: {
    logoText: string;
    nav: NavItem[];
    ctaLabel: string;
    ctaHref: string;
  };
  footer: {
    nav: NavItem[];
    copyright: string;
  };
  home: {
    hero: {
      title: string;
      description: string;
      ctaLabel: string;
      ctaHref: string;
    };
    section02: { title: string; description: string };
    section03: { title: string; description: string };
    section04: { title: string; description: string };
    services: ServiceSlide[];
    whyInvest: {
      title: string;
      body: string;
      ctaLabel: string;
      ctaHref: string;
    };
    stats: StatItem[];
    statsSource: string;
    cta: CtaBlock;
  };
  servicos: {
    hero: { eyebrow: string; title: string };
    packagesTitle: string;
    packages: PackageItem[];
    methodTitle: string;
    methodSteps: MethodStep[];
    cta: CtaBlock;
  };
  sobre: {
    hero: { eyebrow: string; title: string };
    quemSomos: { eyebrow: string; title: string; body: string };
    proposito: TextBlock;
    missao: TextBlock;
    valoresTitle: string;
    valores: TextBlock[];
    visao: TextBlock;
    comoTrabalhamosTitle: string;
    comoTrabalhamos: TextBlock[];
    diferenciaTitle: string;
    diferenciaBody: string;
    diferencia: TextBlock[];
    cta: CtaBlock;
  };
  contactos: {
    hero: { title: string };
    eyebrow: string;
    title: string;
    emailLines: string[];
    endereco: string;
    formTitle: string;
  };
}

export const DEFAULT_CONTENT: SiteContent = {
  header: {
    logoText: "HumanUp",
    nav: [
      { label: "Início", href: "/" },
      { label: "Sobre", href: "/sobre" },
      { label: "Serviços", href: "/servicos" },
      { label: "Contactos", href: "/contactos" },
    ],
    ctaLabel: "Iniciar Sessão",
    ctaHref: "/login",
  },
  footer: {
    nav: [
      { label: "Início", href: "/" },
      { label: "Sobre", href: "/sobre" },
      { label: "Serviços", href: "/servicos" },
      { label: "Contactos", href: "/contactos" },
    ],
    copyright: "Direitos de Autor © 2026 HumanUp",
  },
  home: {
    hero: {
      title: "Felicidade que gera resultados",
      description:
        "Potencie a produtividade e o bem-estar dos seus colaboradores com soluções de diagnóstico e projetos de bem‑estar laboral personalizados.",
      ctaLabel: "Saber Mais",
      ctaHref: "/sobre",
    },
    section02: {
      title: "Felicidade\nOrganizacional\nem Portugal",
      description: "Os números revelam um caminho urgente a percorrer na cultura empresarial portuguesa.",
    },
    section03: {
      title: "Projetos\nde\nMudança",
      description: "Estratégias de bem-estar que ligam pessoas, cultura e resultados.",
    },
    section04: {
      title: "O Custo\nde\nNão Agir",
      description: "Empresas que ignoram o bem-estar pagam um preço elevado — em produtividade, talento e resultados.",
    },
    services: [
      {
        title: "Projetos de Felicidade Organizacional",
        description:
          "Criamos estratégias de bem-estar que ligam pessoas, cultura e resultados. <br>Cada plano é desenhado para transformar o ambiente de trabalho num espaço mais humano, produtivo e sustentável.",
        buttonText: "Solicitar Diagnóstico",
        buttonHref: "/contactos",
      },
      {
        title: "Diagnóstico Organizacional",
        description:
          "Porque conhecer é o primeiro passo para transformar, analisamos o clima interno, os valores vividos e os pontos de melhoria.",
        buttonText: "Saber mais",
        buttonHref: "/servicos",
      },
      {
        title: "Consultoria de <br>Bem-Estar",
        description:
          "Apoiamos líderes e equipas com soluções personalizadas que promovem saúde emocional, motivação e alinhamento cultural.<br>Criamos estratégias de bem-estar que ligam pessoas, cultura e resultados. Cada projeto é desenhado para transformar o ambiente de trabalho num espaço mais humano, produtivo e sustentável.",
        buttonText: "Saber Mais",
        buttonHref: "/servicos",
      },
      {
        title: "Acompanhamento",
        description:
          "Oferecemos <strong>avaliação contínua</strong> das estratégias de bem-estar, com indicadores claros e feedback regular.<br>Acompanhamos líderes e equipas ao longo do processo, garantindo que a felicidade organizacional se traduz em resultados reais.",
        buttonText: "Saber Mais",
        buttonHref: "/servicos",
      },
    ],
    whyInvest: {
      title: "Porquê investir em felicidade organizacional?",
      body:
        "Num mundo em constante mudança, onde a produtividade depende cada vez mais da motivação e do bem-estar das pessoas, as organizações enfrentam um desafio decisivo: criar ambientes que inspirem, valorizem e cuidem dos seus colaboradores.\n\nNão se trata apenas de melhorar o clima interno. Estudos internacionais demonstram que empresas que investem em felicidade organizacional <strong>reduzem o absentismo</strong>, <strong>aumentam a retenção</strong> de talento e conquistam <strong>resultados financeiros superiores</strong>. Em Portugal, os dados revelam que ainda há um longo caminho a percorrer — e é precisamente aqui que surge a oportunidade de transformar a cultura empresarial.\n\nAntes de olhar para os números, é importante compreender que cada percentagem representa mais do que estatística: representa pessoas, equipas e o futuro das organizações.",
      ctaLabel: "Saber Mais",
      ctaHref: "/sobre",
    },
    stats: [
      { value: 53, suffix: "%", label: "dos trabalhadores faltam ao trabalho por <strong>burnout</strong>" },
      { value: 79, suffix: "%", label: "dos colaboradores apresentam <strong>falta de envolvimento</strong> na empresa" },
      { value: 54, suffix: "%", label: "dos trabalhadores <strong>não se sentem valorizados </strong>pela organização" },
      { value: 47, suffix: "%", label: "do tempo os trabalhadores estão a<strong> procrastinar</strong>" },
      { value: 1.4, suffix: "%", label: "<strong>do volume de negócios</strong> das empresas portuguesas <strong>perde-se </strong>devido à quebra de produtividade" },
      { value: 12.4, suffix: " dias", label: "de <strong>absentismo</strong> proveniente do stresse e problemas de saúde psicológica" },
    ],
    statsSource: "Relatórios Gallup, Deloitte, McKinsey, OCDE",
    cta: {
      title: "E se o próximo crescimento do seu negócio viesse da cultura?",
      buttonLabel: "Saber mais",
      buttonHref: "/contactos/",
    },
  },
  servicos: {
    hero: { eyebrow: "descobre como te podemos ajudar a", title: "crescer com propósito" },
    packagesTitle: "Pacotes & Investimento",
    packages: [
      {
        name: "START-UP",
        popular: false,
        features: [
          { text: "Diagnóstico organizacional inicial" },
          { text: "Inquérito de felicidade" },
          { text: "Relatório de resultados + índice" },
        ],
        cta: "Saber Mais",
        ctaHref: "/contactos",
      },
      {
        name: "GO-UP",
        popular: true,
        features: [
          { text: "Tudo do START-UP" },
          { text: "Workshops de bem-estar" },
          { text: "Acompanhamento trimestral" },
          { text: "Plano de ação personalizado" },
        ],
        cta: "Saber Mais",
        ctaHref: "/contactos",
      },
      {
        name: "GROW-UP",
        popular: false,
        features: [
          { text: "Tudo do GO-UP" },
          { text: "Programa de desenvolvimento de lideranças" },
          { text: "Avaliação de impacto semestral" },
          { text: "Consultoria contínua" },
          { text: "Relatório de progresso detalhado" },
        ],
        cta: "Saber Mais",
        ctaHref: "/contactos",
      },
    ],
    methodTitle: "O nosso método",
    methodSteps: [
      { number: "01", title: "Ouvir", description: "Escutamos pessoas e equipas para compreender o contexto, os desafios e as oportunidades." },
      { number: "02", title: "Diagnosticar", description: "Analisamos dados, identificamos padrões e apresentamos um diagnóstico claro e acionável." },
      { number: "03", title: "Agir", description: "Implementamos soluções personalizadas com acompanhamento próximo e medição de resultados." },
      { number: "04", title: "Evoluir", description: "Avaliamos o impacto, ajustamos o rumo e garantimos a sustentabilidade das mudanças." },
    ],
    cta: {
      title: "A mudança começa com uma conversa. Estamos aqui para ouvir.",
      buttonLabel: "Fale Connosco",
      buttonHref: "/contactos/",
    },
  },
  sobre: {
    hero: { eyebrow: "Descubra o impacto da", title: "Felicidade organizacional" },
    quemSomos: {
      eyebrow: "Quem somos",
      title: "HumanUp: Diagnósticos & projetos de bem‑estar laboral",
      body:
        "A HumanUp é um projeto dedicado a elevar o bem-estar, a motivação e a saúde emocional das organizações.\n\nTrabalhamos com metodologias práticas, diagnósticos claros e intervenções que geram impacto real — sempre com proximidade, autenticidade e rigor.",
    },
    proposito: {
      title: "O nosso propósito",
      body: "Contribuir para um mundo de trabalho mais humano, onde as pessoas prosperem, sintam pertença e realização, e as organizações alcancem resultados sustentáveis.",
    },
    missao: {
      title: "A nossa missão",
      body: "Promover bem-estar, felicidade e desenvolvimento humano nas organizações através de metodologias práticas, humanas e baseadas em evidência.",
    },
    valoresTitle: "os nossos valores",
    valores: [
      { title: "Escuta ativa", body: "acreditamos que compreender verdadeiramente pessoas e contextos é o primeiro passo para qualquer mudança real." },
      { title: "Simplicidade", body: "criamos soluções simples, aplicáveis e ajustadas à realidade das organizações — menos teoria, mais impacto." },
      { title: "Autenticidade", body: "trabalhamos com o que é real, útil e necessário, mesmo quando é desconfortável." },
      { title: "Sustentabilidade", body: "tornar o crescimento sustentável é cuidar do equilíbrio entre as pessoas, os recursos e a comunidade." },
    ],
    visao: {
      title: "A nossa visão",
      body: "Ser a referência na transformação do mundo do trabalho, tornando a felicidade e a saúde psicológica pilares essenciais das organizações do futuro.",
    },
    comoTrabalhamosTitle: "Como trabalhamos?",
    comoTrabalhamos: [
      { title: "Escuta & Diagnóstico", body: "Começamos por ouvir. Pessoas, lideranças e contexto organizacional. Identificamos riscos psicossociais e pontos de oportunidade." },
      { title: "Co-criação com liderança e equipas", body: "Desenhamos soluções em conjunto com líderes e equipas para garantir envolvimento e mudanças que fazem sentido no dia a dia." },
      { title: "Acompanhamento & avaliação de impacto", body: "Acompanhamos a implementação, medimos o impacto e garantimos que a felicidade e a saúde psicológica geram resultados reais." },
    ],
    diferenciaTitle: "O que nos diferencia",
    diferenciaBody: "Não acreditamos em soluções genéricas nem em discursos vazios. O nosso trabalho é prático, humano e focado no que realmente faz a diferença no dia a dia das organizações.",
    diferencia: [
      { title: "Abordagem prática e aplicada", body: "Transformamos conhecimento em ação com resultados mensuráveis" },
      { title: "Equipa especializada", body: "Profissionais com experiência em psicologia organizacional e gestão de pessoas" },
      { title: "Acompanhamento contínuo", body: "Suporte permanente para garantir a sustentabilidade das mudanças" },
    ],
    cta: {
      title: "E se o próximo crescimento do seu negócio viesse da cultura?",
      buttonLabel: "Saber mais",
      buttonHref: "/contactos/",
    },
  },
  contactos: {
    hero: { title: "Fale <br />Connosco" },
    eyebrow: "Estamos Aqui Para o Ajudar",
    title: "Preencha o Formulário de Contacto",
    emailLines: ["geral.humanup@gmail.com", "geral@humanup.pt"],
    endereco: "Espinho, Portugal",
    formTitle: "Enviar Mensagem",
  },
};
