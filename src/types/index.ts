export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface ServiceSlide {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export interface CounterItem {
  value: number;
  suffix: string;
  label: string;
}

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
  nav: NavItem[];
  services: ServiceSlide[];
  counters: CounterItem[];
  sourceNote: string;
}
