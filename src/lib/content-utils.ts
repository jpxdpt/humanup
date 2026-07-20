export interface FlatContentItem {
  key: string;
  value: string;
  label: string;
  section: string;
}

function humanizeKey(key: string): string {
  return key
    .replace(/\./g, " — ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanValue(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?strong>/gi, "")
    .replace(/<[^>]+>/g, "");
}

export function flattenContent(obj: unknown, prefix = ""): FlatContentItem[] {
  const items: FlatContentItem[] = [];

  if (typeof obj === "string") {
    const key = prefix;
    items.push({
      key,
      value: cleanValue(obj),
      label: humanizeKey(key),
      section: key.split(".")[0] || "geral",
    });
  } else if (typeof obj === "number" || typeof obj === "boolean") {
    const key = prefix;
    items.push({
      key,
      value: String(obj),
      label: humanizeKey(key),
      section: key.split(".")[0] || "geral",
    });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      items.push(...flattenContent(item, prefix ? `${prefix}.${i}` : `${i}`));
    });
  } else if (obj && typeof obj === "object") {
    Object.entries(obj).forEach(([k, v]) => {
      items.push(...flattenContent(v, prefix ? `${prefix}.${k}` : k));
    });
  }

  return items;
}

export { humanizeKey };
