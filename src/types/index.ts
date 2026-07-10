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

export interface SiteContent {
  nav: NavItem[];
  services: ServiceSlide[];
  counters: CounterItem[];
  sourceNote: string;
}
