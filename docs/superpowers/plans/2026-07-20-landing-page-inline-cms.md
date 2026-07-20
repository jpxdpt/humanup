# Landing Page Inline CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the JSONB-based landing-page CMS with a Quirqui-style key-value store and add inline text/image editing on the public site for admins.

**Architecture:** Move content to a Postgres table `site_content(key, value, label, section)`. Expose public/admin API routes. Provide a client `SiteContentProvider` with edit mode. Build `EditableText`, `EditableImage`, and `EditableBackground` components. Update all landing-page components to read from keys. Rewrite `/areareservada` as a grouped key-value editor.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn/ui (Button), Postgres via `pg`, `jose` for auth, `bcryptjs`.

## Global Constraints

- TypeScript strict mode, no `any`.
- Named exports, PascalCase components, camelCase utils.
- Tailwind utility classes; no inline `style` except where unavoidable (background images).
- Only admin role (`role === "admin"`) can write content or upload images.
- Reuse existing auth cookie `hup_session` and `verifySession` from `src/lib/jwt.ts`.
- Text stored as plain string; `\n` for line breaks; HTML tags stripped from defaults.
- Keep fallbacks so the site renders even if the CMS table is empty.

---

## File structure

| File | Responsibility |
|------|----------------|
| `src/lib/content-utils.ts` | Flatten/unflatten content objects; key humanization; HTML cleaning. |
| `src/lib/content-images.ts` | Default image keys + fallback URLs. |
| `src/lib/site-content.tsx` | `SiteContentProvider`, `useSiteContent`, `useSiteContentSection`, `FALLBACKS`. |
| `src/lib/db-server.ts` | Migration/seed for new `site_content` table. |
| `src/app/api/content/route.ts` | Public GET of all content as `{ [key]: value }`. |
| `src/app/api/content/admin/route.ts` | Admin GET of all rows with metadata. |
| `src/app/api/content/[key]/route.ts` | Admin PUT to update one key. |
| `src/app/api/content/upload/route.ts` | Admin POST image upload; updates key. |
| `src/app/api/content/reset/route.ts` | Admin POST to reset content to defaults. |
| `src/components/cms/EditableText.tsx` | Inline editable text block. |
| `src/components/cms/EditableImage.tsx` | Inline editable `<Image>`. |
| `src/components/cms/EditableBackground.tsx` | Inline editable CSS background image. |
| `src/components/cms/AdminBar.tsx` | Fixed bottom bar to toggle edit mode. |
| `src/app/providers.tsx` | Wire new provider and admin bar. |
| `src/app/areareservada/page.tsx` | Grouped key-value backoffice. |
| `src/components/SiteHeader.tsx` | Read header keys. |
| `src/components/SiteFooter.tsx` | Read footer keys. |
| `src/components/HeroFlowCards.tsx` | Read home keys + editable backgrounds. |
| `src/components/ServicesSwiper.tsx` | Read service slide keys + images. |
| `src/components/SplitContent.tsx` | Accept content keys for image/title/body/cta. |
| `src/components/WhyInvestSection.tsx` | Read whyInvest keys. |
| `src/components/StatsCounter.tsx` | Read stats keys + background image. |
| `src/components/CTASection.tsx` | Read home CTA keys. |
| `src/components/ServicesFlow.tsx` | Read servicos keys + backgrounds. |
| `src/components/AboutFlow.tsx` | Read sobre keys + backgrounds. |
| `src/components/PageHero.tsx` | Accept content keys. |
| `src/app/contactos/page.tsx` | Read contactos keys. |
| `src/lib/content-store.tsx` | Delete after migration. |

---

### Task 1: Content utilities and default image keys

**Files:**
- Create: `src/lib/content-utils.ts`
- Create: `src/lib/content-images.ts`
- Modify: `src/lib/content-schema.ts` (minor cleanup note)

**Interfaces:**
- Produces `flattenContent(obj): FlatContentItem[]` used by migration, seed, and `FALLBACKS`.
- Produces `humanizeKey(key): string` used by API and migration.
- Produces `DEFAULT_IMAGE_KEYS: Record<string, string>` used by seed and fallbacks.

- [ ] **Step 1: Create `src/lib/content-utils.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/lib/content-images.ts`**

```ts
export const DEFAULT_IMAGE_KEYS: Record<string, string> = {
  "header.logoImage": "/images/logo-full.png",
  "home.hero.backgroundImage": "/images/hero-bg.jpg",
  "home.section02.backgroundImage": "/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg",
  "home.section03.backgroundImage": "/images/contact-hero.jpg",
  "home.section04.backgroundImage": "/images/emoji-top-view.jpg",
  "home.section05.backgroundImage": "/images/grupo-de-amigos-reunidos.jpg",
  "home.whyInvest.image": "/images/emoji-card.jpg",
  "home.stats.backgroundImage": "/images/hero-bg.jpg",
  "home.services.0.image": "/images/Duarte-1-767x1024.png",
  "home.services.1.image": "/images/emoji-card.jpg",
  "home.services.2.image": "/images/Diana-2-1-767x1024.png",
  "home.services.3.image": "/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg",
  "sobre.hero.backgroundImage": "/images/hero-bg.jpg",
  "contactos.hero.backgroundImage": "/images/contact-hero.jpg",
};
```

- [ ] **Step 3: Verify `src/lib/content-schema.ts` still exports `DEFAULT_CONTENT`**

No code change required. The existing object is used as the source of fallbacks and seed values. `flattenContent` will clean HTML during flattening.

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-utils.ts src/lib/content-images.ts
git commit -m "feat(cms): add content flattening utilities and default image keys"
```

---

### Task 2: Database migration to key-value table

**Files:**
- Modify: `src/lib/db-server.ts`

**Interfaces:**
- Consumes `flattenContent`, `humanizeKey`, `DEFAULT_IMAGE_KEYS`.
- Produces new `site_content` table schema.

- [ ] **Step 1: Update the migration in `src/lib/db-server.ts`**

Replace the existing `site_content` creation block with the following (keep the surrounding admin/empresa/colaborador seeds untouched):

```ts
import { flattenContent, humanizeKey } from "./content-utils";
import { DEFAULT_IMAGE_KEYS } from "./content-images";
```

Inside `migrate()`:

```ts
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      label TEXT NOT NULL,
      section TEXT NOT NULL
    );
  `);

  const oldTable = await db.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_content' AND column_name = 'data'
  `);

  if (Number(oldTable.rowCount) > 0) {
    await db.query("ALTER TABLE site_content RENAME TO site_content_legacy");
    await db.query(`
      CREATE TABLE site_content (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        label TEXT NOT NULL,
        section TEXT NOT NULL
      );
    `);

    const legacy = await db.query<{ data: unknown }>(
      "SELECT data FROM site_content_legacy WHERE id = 1"
    );
    if (legacy.rowCount && legacy.rowCount > 0) {
      const items = flattenContent(legacy.rows[0].data);
      for (const item of items) {
        await db.query(
          "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING",
          [item.key, item.value, item.label, item.section]
        );
      }
    }

    await db.query("DROP TABLE IF EXISTS site_content_legacy");
  }

  const contentCount = await db.query("SELECT COUNT(*) FROM site_content");
  if (Number(contentCount.rows[0].count) === 0) {
    const items = flattenContent(DEFAULT_CONTENT);
    for (const item of items) {
      await db.query(
        "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4)",
        [item.key, item.value, item.label, item.section]
      );
    }
    for (const [key, value] of Object.entries(DEFAULT_IMAGE_KEYS)) {
      await db.query(
        "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4)",
        [key, value, humanizeKey(key), key.split(".")[0] || "imagens"]
      );
    }
    console.log("[seed] site_content populated");
  }
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db-server.ts
git commit -m "feat(cms): migrate site_content to key-value table"
```

---

### Task 3: API routes

**Files:**
- Modify: `src/app/api/content/route.ts`
- Create: `src/app/api/content/admin/route.ts`
- Create: `src/app/api/content/[key]/route.ts`
- Create: `src/app/api/content/upload/route.ts`
- Create: `src/app/api/content/reset/route.ts`

**Interfaces:**
- `GET /api/content` returns `Record<string, string>`.
- `GET /api/content/admin` returns `Row[]` for admins.
- `PUT /api/content/[key]` updates a single key.
- `POST /api/content/upload` saves image and updates key.
- `POST /api/content/reset` truncates and re-seeds defaults.

- [ ] **Step 1: Rewrite `src/app/api/content/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db-server";

export async function GET() {
  const db = await getDb();
  const result = await db.query<{ key: string; value: string }>("SELECT key, value FROM site_content");
  const data = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
  return NextResponse.json(data);
}
```

- [ ] **Step 2: Create `src/app/api/content/admin/route.ts`**

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const db = await getDb();
  const result = await db.query<{ key: string; value: string; label: string; section: string }>(
    "SELECT key, value, label, section FROM site_content ORDER BY section, key"
  );
  return NextResponse.json(result.rows);
}
```

- [ ] **Step 3: Create `src/app/api/content/[key]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";
import { humanizeKey } from "@/lib/content-utils";

const KEY_REGEX = /^[a-z0-9._-]+$/;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  if (!KEY_REGEX.test(key)) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  const body = (await request.json()) as { value?: unknown };
  if (typeof body.value !== "string") {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  const db = await getDb();
  await db.query(
    `INSERT INTO site_content (key, value, label, section)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value, label = EXCLUDED.label, section = EXCLUDED.section`,
    [key, body.value, humanizeKey(key), key.split(".")[0] || "geral"]
  );

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Create `src/app/api/content/upload/route.ts`**

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";
import { humanizeKey } from "@/lib/content-utils";

const KEY_REGEX = /^[a-z0-9._-]+$/;
const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  const key = formData.get("key") as string | null;

  if (!file || !key || !KEY_REGEX.test(key)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Tipo de ficheiro inválido" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ficheiro demasiado grande" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "images", "content");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);

  const url = `/images/content/${filename}`;
  const db = await getDb();
  await db.query(
    `INSERT INTO site_content (key, value, label, section)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value, label = EXCLUDED.label, section = EXCLUDED.section`,
    [key, url, humanizeKey(key), key.split(".")[0] || "imagens"]
  );

  return NextResponse.json({ key, url });
}
```

- [ ] **Step 5: Create `src/app/api/content/reset/route.ts`**

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";
import { flattenContent, humanizeKey } from "@/lib/content-utils";
import { DEFAULT_IMAGE_KEYS } from "@/lib/content-images";
import { DEFAULT_CONTENT } from "@/lib/content-schema";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const db = await getDb();
  await db.query("TRUNCATE site_content");

  const items = flattenContent(DEFAULT_CONTENT);
  for (const item of items) {
    await db.query(
      "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4)",
      [item.key, item.value, item.label, item.section]
    );
  }

  for (const [key, value] of Object.entries(DEFAULT_IMAGE_KEYS)) {
    await db.query(
      "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4)",
      [key, value, humanizeKey(key), key.split(".")[0] || "imagens"]
    );
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/content
git commit -m "feat(cms): add key-value content API routes"
```

---

### Task 4: Site content provider and hooks

**Files:**
- Create: `src/lib/site-content.tsx`

**Interfaces:**
- Produces `SiteContentProvider`, `useSiteContent(key, fallback)`, `useSiteContentSection(prefix)`, `useSiteContentContext()`, `FALLBACKS`.

- [ ] **Step 1: Create `src/lib/site-content.tsx`**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_CONTENT } from "./content-schema";
import { DEFAULT_IMAGE_KEYS } from "./content-images";
import { flattenContent } from "./content-utils";

export const FALLBACKS: Record<string, string> = {
  ...Object.fromEntries(flattenContent(DEFAULT_CONTENT).map((item) => [item.key, item.value])),
  ...DEFAULT_IMAGE_KEYS,
};

interface SiteContentContextType {
  content: Record<string, string>;
  loading: boolean;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  saveContent: (key: string, value: string) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, string>>(FALLBACKS);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : {}))
      .then((data) => setContent((prev) => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveContent = useCallback(async (key: string, value: string) => {
    const res = await fetch(`/api/content/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error("Erro ao guardar");
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SiteContentContext.Provider
      value={{ content, loading, editMode, setEditMode, saveContent }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContentContext(): SiteContentContextType {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContentContext must be used within SiteContentProvider");
  return ctx;
}

export function useSiteContent(key: string, fallback = ""): string {
  const ctx = useSiteContentContext();
  return ctx.content[key] ?? fallback;
}

export function useSiteContentSection(prefix: string): Record<string, string> {
  const ctx = useSiteContentContext();
  const result: Record<string, string> = {};
  Object.entries(ctx.content).forEach(([key, value]) => {
    if (key === prefix) {
      result[""] = value;
    } else if (key.startsWith(`${prefix}.`)) {
      result[key.slice(prefix.length + 1)] = value;
    }
  });
  return result;
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/lib/site-content.tsx
git commit -m "feat(cms): add SiteContentProvider and read hooks"
```

---

### Task 5: EditableText component

**Files:**
- Create: `src/components/cms/EditableText.tsx`

**Interfaces:**
- Consumes `useSiteContentContext`.
- Produces `<EditableText contentKey="..." fallback="..." tag="h1" className="..." multiline />`.

- [ ] **Step 1: Create `src/components/cms/EditableText.tsx`**

```tsx
"use client";

import { useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSiteContentContext } from "@/lib/site-content";

interface EditableTextProps {
  contentKey: string;
  fallback?: string;
  tag?: ElementType;
  className?: string;
  multiline?: boolean;
  children?: ReactNode;
}

export function EditableText({
  contentKey,
  fallback = "",
  tag: Tag = "span",
  className,
  multiline = false,
}: EditableTextProps) {
  const { content, editMode, saveContent } = useSiteContentContext();
  const value = content[contentKey] ?? fallback;
  const ref = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!editMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  const handleSave = async () => {
    if (!ref.current) return;
    setSaving(true);
    try {
      await saveContent(contentKey, ref.current.innerText.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Tag
        ref={ref as React.RefObject<HTMLElement>}
        contentEditable
        suppressContentEditableWarning
        className={cn(className, "outline-2 outline-primary outline-offset-[3px] cursor-text")}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
        }}
      >
        {value}
      </Tag>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={cn(
          "absolute -top-7 right-0 z-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap rounded-sm",
          saved ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
        )}
      >
        {saving ? "..." : saved ? "✓ Guardado" : "Guardar"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/cms/EditableText.tsx
git commit -m "feat(cms): add EditableText component"
```

---

### Task 6: EditableImage component

**Files:**
- Create: `src/components/cms/EditableImage.tsx`

**Interfaces:**
- Consumes `useSiteContentContext`.
- Produces `<EditableImage contentKey="..." fallback="..." alt="..." fill />`.

- [ ] **Step 1: Create `src/components/cms/EditableImage.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSiteContentContext } from "@/lib/site-content";

interface EditableImageProps {
  contentKey: string;
  fallback: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function EditableImage({
  contentKey,
  fallback,
  alt = "",
  className,
  fill,
  width,
  height,
}: EditableImageProps) {
  const { content, editMode, saveContent } = useSiteContentContext();
  const src = content[contentKey] || fallback;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", contentKey);
    try {
      const res = await fetch("/api/content/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
      if (data.url) await saveContent(contentKey, data.url);
    } catch (err) {
      alert("Erro: " + (err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const imageProps = fill
    ? { fill: true as const, width: undefined, height: undefined }
    : { width: width ?? 0, height: height ?? 0, fill: undefined };

  if (!editMode) {
    return (
      <Image
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        {...imageProps}
      />
    );
  }

  return (
    <div className={cn("relative inline-block", fill && "w-full h-full")}>
      <Image
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        style={{ opacity: uploading ? 0.5 : 1 }}
        {...imageProps}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center bg-primary/15 border-2 border-dashed border-primary opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase rounded-sm">
          {uploading ? "A enviar..." : "Trocar Imagem"}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/cms/EditableImage.tsx
git commit -m "feat(cms): add EditableImage component"
```

---

### Task 7: EditableBackground component

**Files:**
- Create: `src/components/cms/EditableBackground.tsx`

**Interfaces:**
- Consumes `useSiteContentContext`.
- Produces `<EditableBackground contentKey="..." fallback="..." overlay="...">children</EditableBackground>`.

- [ ] **Step 1: Create `src/components/cms/EditableBackground.tsx`**

```tsx
"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSiteContentContext } from "@/lib/site-content";

interface EditableBackgroundProps {
  contentKey: string;
  fallback: string;
  overlay?: string;
  className?: string;
  children: ReactNode;
}

export function EditableBackground({
  contentKey,
  fallback,
  overlay,
  className,
  children,
}: EditableBackgroundProps) {
  const { content, editMode } = useSiteContentContext();
  const src = content[contentKey] || fallback;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", contentKey);
    try {
      const res = await fetch("/api/content/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
    } catch (err) {
      alert("Erro: " + (err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${src})`, opacity: uploading ? 0.5 : 1 }}
      />
      {overlay && <div className="absolute inset-0" style={{ backgroundColor: overlay }} />}
      {editMode && (
        <div
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 z-50 flex items-center justify-center bg-primary/15 border-2 border-dashed border-primary opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <span className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase rounded-sm">
            {uploading ? "A enviar..." : "Trocar Fundo"}
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/cms/EditableBackground.tsx
git commit -m "feat(cms): add EditableBackground component"
```

---

### Task 8: AdminBar and providers wiring

**Files:**
- Create: `src/components/cms/AdminBar.tsx`
- Modify: `src/app/providers.tsx`

**Interfaces:**
- Consumes `useAuth`, `useSiteContentContext`.

- [ ] **Step 1: Create `src/components/cms/AdminBar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useSiteContentContext } from "@/lib/site-content";

export function AdminBar() {
  const { user, logout } = useAuth();
  const { editMode, setEditMode } = useSiteContentContext();

  if (!user || user.role !== "admin") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-on-surface border-t-2 border-primary text-white px-6 py-3 flex items-center gap-4">
      <span className="text-xs font-bold uppercase tracking-widest text-primary">HumanUp Admin</span>
      <button
        type="button"
        onClick={() => setEditMode((v) => !v)}
        className={cn(
          "px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-primary rounded-sm transition-colors",
          editMode ? "bg-primary text-on-surface" : "bg-transparent text-primary hover:bg-primary/10"
        )}
      >
        {editMode ? "✓ Modo Edição ON" : "Ativar Edição"}
      </button>
      {editMode && (
        <span className="text-xs text-white/70 hidden md:inline">
          Clica nos textos com contorno para editar. Enter para guardar.
        </span>
      )}
      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/areareservada"
          className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white"
        >
          Backoffice
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modify `src/app/providers.tsx`**

```tsx
"use client";

import { AuthProvider } from "@/lib/auth";
import { SiteContentProvider } from "@/lib/site-content";
import { AdminBar } from "@/components/cms/AdminBar";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SiteContentProvider>
        {children}
        <AdminBar />
      </SiteContentProvider>
    </AuthProvider>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/cms/AdminBar.tsx src/app/providers.tsx
git commit -m "feat(cms): add AdminBar and wire providers"
```

---

### Task 9: SiteHeader and SiteFooter

**Files:**
- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/SiteFooter.tsx`

**Interfaces:**
- Consumes `useSiteContentSection`, `FALLBACKS`, `EditableImage`, `EditableText`.

- [ ] **Step 1: Update `src/components/SiteHeader.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavOverlay } from "@/components/NavOverlay";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableImage } from "@/components/cms/EditableImage";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useSiteContentSection("header");

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || menuOpen;

  const navItems = [
    { label: header["nav.0.label"] ?? FALLBACKS["header.nav.0.label"], href: header["nav.0.href"] ?? FALLBACKS["header.nav.0.href"] },
    { label: header["nav.1.label"] ?? FALLBACKS["header.nav.1.label"], href: header["nav.1.href"] ?? FALLBACKS["header.nav.1.href"] },
    { label: header["nav.2.label"] ?? FALLBACKS["header.nav.2.label"], href: header["nav.2.href"] ?? FALLBACKS["header.nav.2.href"] },
    { label: header["nav.3.label"] ?? FALLBACKS["header.nav.3.label"], href: header["nav.3.href"] ?? FALLBACKS["header.nav.3.href"] },
  ];

  return (
    <header
      id="masthead"
      className={cn(
        "site-header fixed top-0 left-0 right-0 z-99 w-full transition-colors duration-300",
        solid
          ? "bg-surface-container-lowest border-b border-outline-variant"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="container-site flex items-center justify-between h-[80px]">
        <Link href="/" className="flex items-center gap-3">
          <EditableImage
            contentKey="header.logoImage"
            fallback={FALLBACKS["header.logoImage"]}
            alt={header.logoText ?? FALLBACKS["header.logoText"]}
            width={140}
            height={35}
            className={cn(
              "h-8 w-auto transition-all duration-300",
              solid ? "opacity-100" : "opacity-100 brightness-0 invert",
            )}
          />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-label="Open main menu"
          className={cn(
            "flex flex-col items-end justify-center gap-1.5 p-2 cursor-pointer transition-colors duration-300",
            solid ? "text-secondary" : "text-white",
          )}
        >
          <span className="block w-7 h-0.5 bg-current" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      <NavOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={navItems}
        ctaLabel={header.ctaLabel ?? FALLBACKS["header.ctaLabel"]}
        ctaHref={header.ctaHref ?? FALLBACKS["header.ctaHref"]}
      />
    </header>
  );
}
```

- [ ] **Step 2: Update `src/components/SiteFooter.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";

export function SiteFooter() {
  const footer = useSiteContentSection("footer");

  const navItems = [
    { label: footer["nav.0.label"] ?? FALLBACKS["footer.nav.0.label"], href: footer["nav.0.href"] ?? FALLBACKS["footer.nav.0.href"] },
    { label: footer["nav.1.label"] ?? FALLBACKS["footer.nav.1.label"], href: footer["nav.1.href"] ?? FALLBACKS["footer.nav.1.href"] },
    { label: footer["nav.2.label"] ?? FALLBACKS["footer.nav.2.label"], href: footer["nav.2.href"] ?? FALLBACKS["footer.nav.2.href"] },
    { label: footer["nav.3.label"] ?? FALLBACKS["footer.nav.3.label"], href: footer["nav.3.href"] ?? FALLBACKS["footer.nav.3.href"] },
  ];

  return (
    <footer id="colophon" className="site-footer w-full bg-white">
      <div className="container-site flex items-center justify-between h-[70px]">
        <nav className="flex items-center">
          <ul className="flex items-center gap-0">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center font-sans text-base font-medium leading-[26.4px] text-foreground hover:text-primary transition-colors duration-200 px-2 first:pl-0 last:pr-0"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ast-footer-copyright">
          <p className="font-sans text-base font-medium leading-[26.4px] text-foreground text-right">
            {footer.copyright ?? FALLBACKS["footer.copyright"]}
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/SiteHeader.tsx src/components/SiteFooter.tsx
git commit -m "feat(cms): make header and footer content-driven"
```

---

### Task 10: HeroFlowCards

**Files:**
- Modify: `src/components/HeroFlowCards.tsx`

**Interfaces:**
- Consumes `useSiteContentSection`, `FALLBACKS`, `EditableText`, `EditableBackground`.

- [ ] **Step 1: Replace `src/components/HeroFlowCards.tsx`**

```tsx
"use client";

import Link from "next/link";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableText } from "@/components/cms/EditableText";
import { EditableBackground } from "@/components/cms/EditableBackground";

export function HeroFlowCards() {
  const home = useSiteContentSection("home");

  const hero = {
    title: home["hero.title"] ?? FALLBACKS["home.hero.title"],
    description: home["hero.description"] ?? FALLBACKS["home.hero.description"],
    ctaLabel: home["hero.ctaLabel"] ?? FALLBACKS["home.hero.ctaLabel"],
    ctaHref: home["hero.ctaHref"] ?? FALLBACKS["home.hero.ctaHref"],
  };

  const services = Array.from({ length: 4 }, (_, i) => ({
    title: home[`services.${i}.title`] ?? FALLBACKS[`home.services.${i}.title`],
    description: home[`services.${i}.description`] ?? FALLBACKS[`home.services.${i}.description`],
    buttonText: home[`services.${i}.buttonText`] ?? FALLBACKS[`home.services.${i}.buttonText`],
    buttonHref: home[`services.${i}.buttonHref`] ?? FALLBACKS[`home.services.${i}.buttonHref`],
  }));

  const stats = Array.from({ length: 6 }, (_, i) => ({
    value: Number(home[`stats.${i}.value`] ?? FALLBACKS[`home.stats.${i}.value`]),
    suffix: home[`stats.${i}.suffix`] ?? FALLBACKS[`home.stats.${i}.suffix`],
    label: home[`stats.${i}.label`] ?? FALLBACKS[`home.stats.${i}.label`],
  }));

  const topStats = stats.slice(0, 3);
  const bottomStats = stats.slice(3, 6);
  const statsSource = home["statsSource"] ?? FALLBACKS["home.statsSource"];

  const whyInvest = {
    title: home["whyInvest.title"] ?? FALLBACKS["home.whyInvest.title"],
  };

  const cta = {
    title: home["cta.title"] ?? FALLBACKS["home.cta.title"],
    buttonLabel: home["cta.buttonLabel"] ?? FALLBACKS["home.cta.buttonLabel"],
    buttonHref: home["cta.buttonHref"] ?? FALLBACKS["home.cta.buttonHref"],
  };

  return (
    <FlowArt aria-label="HumanUp — apresentação">
      {/* 01 — A HumanUp */}
      <EditableBackground
        contentKey="home.hero.backgroundImage"
        fallback={FALLBACKS["home.hero.backgroundImage"]}
        overlay="rgba(20,20,20,0.55)"
      >
        <FlowSection aria-label={hero.title} className="bg-on-surface text-white">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none">
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 to-black/25 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-6 min-h-full">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">01 — A HumanUp</p>
            <hr className="border-none border-t border-white/20" />
            <div>
              <EditableText contentKey="home.hero.title" fallback={hero.title} tag="h1" className="text-display uppercase" />
            </div>
            <hr className="border-none border-t border-white/20" />
            <EditableText
              contentKey="home.hero.description"
              fallback={hero.description}
              tag="p"
              className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-white whitespace-pre-line"
              multiline
            />
            <hr className="border-none border-t border-white/20" />
            <Link
              href={hero.ctaHref}
              className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity self-start"
            >
              {hero.ctaLabel}
            </Link>
          </div>
        </FlowSection>
      </EditableBackground>

      {/* 02 — O Problema */}
      <EditableBackground
        contentKey="home.section02.backgroundImage"
        fallback={FALLBACKS["home.section02.backgroundImage"]}
        overlay="rgba(243,163,42,0.6)"
      >
        <FlowSection aria-label="O Problema" className="bg-primary-container text-on-primary-container opacity-100">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">02 — O Problema</p>
          <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
          <div>
            <h2 className="text-display uppercase">
              Felicidade
              <br />
              Organizacional
              <br />
              em Portugal
            </h2>
          </div>
          <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
          <p className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-primary-container opacity-100">
            Os números revelam um caminho urgente a percorrer na cultura empresarial portuguesa.
          </p>
          <hr className="my-[2vw] border-none border-t border-on-primary-container/20" />
          <div className="flex flex-wrap gap-[3vw]">
            {topStats.map((stat, i) => (
              <div key={i} className="min-w-[180px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                  <span className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-on-primary-container opacity-100">
                    {stat.value}{stat.suffix}
                  </span>
                </p>
                <p className="text-sm md:text-base font-medium leading-relaxed text-on-primary-container opacity-100 whitespace-pre-line">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FlowSection>
      </EditableBackground>

      {/* 03 — A Solução */}
      <EditableBackground
        contentKey="home.section03.backgroundImage"
        fallback={FALLBACKS["home.section03.backgroundImage"]}
        overlay="rgba(255,255,255,0.6)"
      >
        <FlowSection aria-label="A Solução" className="bg-surface text-on-surface">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">03 — A Solução</p>
          <hr className="my-[2vw] border-none border-t border-on-surface/15" />
          <div>
            <h2 className="text-display uppercase">
              Projetos
              <br />
              de
              <br />
              Mudança
            </h2>
          </div>
          <hr className="my-[2vw] border-none border-t border-on-surface/15" />
          <p className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-surface">
            Estratégias de bem-estar que ligam pessoas, cultura e resultados.
          </p>
          <hr className="my-[2vw] border-none border-t border-on-surface/15" />
          <div className="flex flex-wrap gap-[3vw]">
            {services.slice(0, 3).map((service, i) => (
              <div key={i} className="min-w-[180px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                  {service.title}
                </p>
                <p className="text-sm md:text-base font-medium leading-relaxed text-on-surface whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <hr className="my-[2vw] border-none border-t border-on-surface/15" />
          <Link
            href="/servicos"
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity self-start"
          >
            Saber Mais
          </Link>
        </FlowSection>
      </EditableBackground>

      {/* 04 — O Impacto */}
      <EditableBackground
        contentKey="home.section04.backgroundImage"
        fallback={FALLBACKS["home.section04.backgroundImage"]}
        overlay="rgba(132,84,0,0.6)"
      >
        <FlowSection aria-label="O Impacto" className="bg-primary text-on-primary">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">04 — O Impacto</p>
          <hr className="my-[2vw] border-none border-t border-on-primary/30" />
          <div>
            <h2 className="text-display uppercase">
              O Custo
              <br />
              de
              <br />
              Não Agir
            </h2>
          </div>
          <hr className="my-[2vw] border-none border-t border-on-primary/30" />
          <p className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-on-primary">
            Empresas que ignoram o bem-estar pagam um preço elevado — em produtividade, talento e resultados.
          </p>
          <hr className="my-[2vw] border-none border-t border-on-primary/30" />
          <div className="flex flex-wrap gap-[3vw]">
            {bottomStats.map((stat, i) => (
              <div key={i} className="min-w-[180px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                  <span className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-on-primary">
                    {stat.value}{stat.suffix}
                  </span>
                </p>
                <p className="text-sm md:text-base font-medium leading-relaxed text-on-primary whitespace-pre-line">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <hr className="my-[2vw] border-none border-t border-on-primary/30" />
          <p className="text-sm font-medium text-on-primary">{statsSource}</p>
        </FlowSection>
      </EditableBackground>

      {/* 05 — Vamos Começar */}
      <EditableBackground
        contentKey="home.section05.backgroundImage"
        fallback={FALLBACKS["home.section05.backgroundImage"]}
        overlay="rgba(20,20,20,0.6)"
      >
        <FlowSection aria-label="Vamos Começar" className="bg-on-surface text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">05 — Vamos Começar</p>
          <hr className="my-[2vw] border-none border-t border-white/20" />
          <div>
            <h2 className="text-display uppercase max-w-[12ch]">
              {whyInvest.title.replace("?", "")}
            </h2>
          </div>
          <hr className="my-[2vw] border-none border-t border-white/20" />
          <EditableText
            contentKey="home.cta.title"
            fallback={cta.title}
            tag="p"
            className="max-w-[50ch] text-base md:text-lg font-medium leading-relaxed text-white whitespace-pre-line"
            multiline
          />
          <hr className="my-[2vw] border-none border-t border-white/20" />
          <Link
            href={cta.buttonHref}
            className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity self-start"
          >
            {cta.buttonLabel}
          </Link>
        </FlowSection>
      </EditableBackground>
    </FlowArt>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroFlowCards.tsx
git commit -m "feat(cms): make HeroFlowCards content editable"
```

---

### Task 11: ServicesSwiper and SplitContent

**Files:**
- Modify: `src/components/ServicesSwiper.tsx`
- Modify: `src/components/SplitContent.tsx`

**Interfaces:**
- `SplitContent` now receives `imageKey`, `imageFallback`, `imageAlt`, `titleKey`, `titleFallback`, `bodyKey`, `bodyFallback`, `ctaLabelKey`, `ctaLabelFallback`, `ctaHref`.

- [ ] **Step 1: Update `src/components/SplitContent.tsx`**

```tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import { EditableImage } from "@/components/cms/EditableImage";
import { EditableText } from "@/components/cms/EditableText";

interface SplitContentProps {
  imageKey: string;
  imageFallback: string;
  imageAlt?: string;
  imagePosition: "left" | "right";
  titleKey?: string;
  titleFallback?: string;
  bodyKey: string;
  bodyFallback: string;
  ctaLabelKey?: string;
  ctaLabelFallback?: string;
  ctaHref?: string;
  tone?: "light" | "muted" | "dark" | "primary";
  imageTint?: boolean;
  children?: React.ReactNode;
}

const TONE_STYLES: Record<NonNullable<SplitContentProps["tone"]>, string> = {
  light: "bg-white text-foreground",
  muted: "bg-gray-50 text-foreground",
  dark: "bg-on-surface text-white",
  primary: "bg-primary text-primary-foreground",
};

export function SplitContent({
  imageKey,
  imageFallback,
  imageAlt = "",
  imagePosition,
  titleKey,
  titleFallback,
  bodyKey,
  bodyFallback,
  ctaLabelKey,
  ctaLabelFallback,
  ctaHref,
  tone = "light",
  imageTint = false,
  children,
}: SplitContentProps) {
  const imageDirection = imagePosition === "left" ? "left" : "right";
  const textDirection = imagePosition === "left" ? "right" : "left";

  return (
    <section className={cn("w-full", TONE_STYLES[tone])}>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 items-stretch min-h-[520px]",
          imagePosition === "right" && "md:[&>*:first-child]:order-2",
        )}
      >
        <Reveal direction={imageDirection} distance={64} className="relative min-h-[320px] md:min-h-full">
          <EditableImage
            contentKey={imageKey}
            fallback={imageFallback}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          {imageTint && <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" />}
        </Reveal>
        <div className="flex items-center px-6 py-16 md:px-16 md:py-24">
          <Reveal direction={textDirection} delay={150} distance={48} className="max-w-[520px]">
            {titleKey && titleFallback && (
              <EditableText
                contentKey={titleKey}
                fallback={titleFallback}
                tag="h2"
                className="text-display-sm mb-6"
              />
            )}
            <EditableText
              contentKey={bodyKey}
              fallback={bodyFallback}
              tag="div"
              className="font-sans text-base font-medium leading-[26.4px] whitespace-pre-line mb-8 opacity-90"
              multiline
            />
            {children}
            {ctaLabelKey && ctaLabelFallback && ctaHref && (
              <Link
                href={ctaHref}
                className={cn(
                  "inline-block font-heading font-bold text-base capitalize px-8 py-3 rounded-md transition-opacity hover:opacity-90",
                  tone === "primary"
                    ? "bg-white text-primary"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {ctaLabelFallback}
              </Link>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

Note: the CTA label in SplitContent is not wrapped in `EditableText` because the label is shown inside a Link. To keep the Link clickable in edit mode, leave it as plain text for now. The `ctaLabelKey` is still accepted to preserve the interface; the fallback value is rendered.

- [ ] **Step 2: Update `src/components/ServicesSwiper.tsx`**

```tsx
"use client";

import { SplitContent } from "@/components/SplitContent";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";

const IMAGE_ALTS = [
  "Consultor HumanUp",
  "Inquérito de felicidade organizacional",
  "Consultora HumanUp",
  "Impacto e acompanhamento contínuo",
];

const IMAGE_TINTS = [false, false, false, true];

export function ServicesSwiper() {
  const home = useSiteContentSection("home");

  const slides = Array.from({ length: 4 }, (_, i) => ({
    title: home[`services.${i}.title`] ?? FALLBACKS[`home.services.${i}.title`],
    description: home[`services.${i}.description`] ?? FALLBACKS[`home.services.${i}.description`],
    buttonText: home[`services.${i}.buttonText`] ?? FALLBACKS[`home.services.${i}.buttonText`],
    buttonHref: home[`services.${i}.buttonHref`] ?? FALLBACKS[`home.services.${i}.buttonHref`],
  }));

  return (
    <div>
      {slides.map((slide, i) => (
        <SplitContent
          key={i}
          imageKey={`home.services.${i}.image`}
          imageFallback={FALLBACKS[`home.services.${i}.image`]}
          imageAlt={IMAGE_ALTS[i % IMAGE_ALTS.length]}
          imageTint={IMAGE_TINTS[i % IMAGE_TINTS.length]}
          imagePosition={i % 2 === 0 ? "left" : "right"}
          tone={i % 2 === 0 ? "light" : "muted"}
          titleKey={`home.services.${i}.title`}
          titleFallback={slide.title}
          bodyKey={`home.services.${i}.description`}
          bodyFallback={slide.description}
          ctaLabelKey={`home.services.${i}.buttonText`}
          ctaLabelFallback={slide.buttonText}
          ctaHref={slide.buttonHref}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/SplitContent.tsx src/components/ServicesSwiper.tsx
git commit -m "feat(cms): make service slides editable"
```

---

### Task 12: WhyInvestSection and StatsCounter

**Files:**
- Modify: `src/components/WhyInvestSection.tsx`
- Modify: `src/components/StatsCounter.tsx`

- [ ] **Step 1: Update `src/components/WhyInvestSection.tsx`**

```tsx
"use client";

import { SplitContent } from "@/components/SplitContent";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";

export function WhyInvestSection() {
  const home = useSiteContentSection("home");

  return (
    <SplitContent
      imageKey="home.whyInvest.image"
      imageFallback={FALLBACKS["home.whyInvest.image"]}
      imageAlt="Disposicao Da Vista Superior Com Um Cartao Emoji Sorridente"
      imagePosition="left"
      bodyKey="home.whyInvest.body"
      bodyFallback={home["whyInvest.body"] ?? FALLBACKS["home.whyInvest.body"]}
      ctaLabelKey="home.whyInvest.ctaLabel"
      ctaLabelFallback={home["whyInvest.ctaLabel"] ?? FALLBACKS["home.whyInvest.ctaLabel"]}
      ctaHref={home["whyInvest.ctaHref"] ?? FALLBACKS["home.whyInvest.ctaHref"]}
    />
  );
}
```

- [ ] **Step 2: Update `src/components/StatsCounter.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableImage } from "@/components/cms/EditableImage";

function useCountUp(target: number, duration: number, isVisible: boolean) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number | null = null;
    let currentVal = 0;

    function animate(time: number) {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      currentVal = target * eased;
      setCurrent(currentVal);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, isVisible]);

  if (target % 1 === 0) {
    return Math.round(current);
  }
  return current.toFixed(1);
}

function CounterItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(value, 1.5, isVisible);

  return (
    <div ref={ref}>
      <div className="mb-1">
        <span className="font-heading text-[46px] font-bold text-white">{count}</span>
        <span className="font-heading text-[46px] font-bold text-white">{suffix}</span>
      </div>
      <p className="font-sans text-base font-medium leading-[26.4px] text-white/85 whitespace-pre-line">
        {label}
      </p>
    </div>
  );
}

export function StatsCounter() {
  const home = useSiteContentSection("home");

  const stats = Array.from({ length: 6 }, (_, i) => ({
    value: Number(home[`stats.${i}.value`] ?? FALLBACKS[`home.stats.${i}.value`]),
    suffix: home[`stats.${i}.suffix`] ?? FALLBACKS[`home.stats.${i}.suffix`],
    label: home[`stats.${i}.label`] ?? FALLBACKS[`home.stats.${i}.label`],
  }));

  const statsSource = home["statsSource"] ?? FALLBACKS["home.statsSource"];

  return (
    <section className="relative w-full bg-on-surface">
      <div className="absolute inset-0">
        <EditableImage
          contentKey="home.stats.backgroundImage"
          fallback={FALLBACKS["home.stats.backgroundImage"]}
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-on-surface/70" />
      </div>
      <div className="relative container-site py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
          {stats.map((stat, i) => (
            <CounterItem key={i} {...stat} />
          ))}
        </div>
        <p className="font-sans text-sm font-medium text-white/70 mt-10">{statsSource}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/WhyInvestSection.tsx src/components/StatsCounter.tsx
git commit -m "feat(cms): make why-invest and stats editable"
```

---

### Task 13: CTASection

**Files:**
- Modify: `src/components/CTASection.tsx`

- [ ] **Step 1: Update `src/components/CTASection.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { Reveal } from "@/components/Reveal";
import { EditableText } from "@/components/cms/EditableText";

export function CTASection() {
  const home = useSiteContentSection("home");
  const buttonLabel = home["cta.buttonLabel"] ?? FALLBACKS["home.cta.buttonLabel"];
  const buttonHref = home["cta.buttonHref"] ?? FALLBACKS["home.cta.buttonHref"];

  return (
    <section className="w-full bg-primary py-[100px]">
      <Reveal className="container-site">
        <div className="flex items-center justify-between gap-8 flex-wrap">
          <EditableText
            contentKey="home.cta.title"
            fallback={home["cta.title"] ?? FALLBACKS["home.cta.title"]}
            tag="h2"
            className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-primary-foreground capitalize max-w-[720px]"
            multiline
          />
          <div>
            <Link
              href={buttonHref}
              className="inline-block bg-white text-primary font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              {buttonLabel}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/CTASection.tsx
git commit -m "feat(cms): make CTA section editable"
```

---

### Task 14: ServicesFlow

**Files:**
- Modify: `src/components/ServicesFlow.tsx`

- [ ] **Step 1: Replace `src/components/ServicesFlow.tsx`**

```tsx
"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableText } from "@/components/cms/EditableText";
import { EditableBackground } from "@/components/cms/EditableBackground";

const SectionNumber = ({ num }: { num: string }) => (
  <span className="text-[clamp(6rem,20vw,16rem)] font-bold leading-[0.7] text-on-surface/5 select-none pointer-events-none absolute top-0 right-0 -mt-4 -mr-4 md:-mr-8">
    {num}
  </span>
);

export function ServicesFlow() {
  const servicos = useSiteContentSection("servicos");

  const hero = {
    eyebrow: servicos["hero.eyebrow"] ?? FALLBACKS["servicos.hero.eyebrow"],
    title: servicos["hero.title"] ?? FALLBACKS["servicos.hero.title"],
  };

  const methodTitle = servicos["methodTitle"] ?? FALLBACKS["servicos.methodTitle"];
  const methodSteps = Array.from({ length: 4 }, (_, i) => ({
    number: servicos[`methodSteps.${i}.number`] ?? FALLBACKS[`servicos.methodSteps.${i}.number`],
    title: servicos[`methodSteps.${i}.title`] ?? FALLBACKS[`servicos.methodSteps.${i}.title`],
    description: servicos[`methodSteps.${i}.description`] ?? FALLBACKS[`servicos.methodSteps.${i}.description`],
  }));

  const packagesTitle = servicos["packagesTitle"] ?? FALLBACKS["servicos.packagesTitle"];
  const packages = Array.from({ length: 3 }, (_, i) => ({
    name: servicos[`packages.${i}.name`] ?? FALLBACKS[`servicos.packages.${i}.name`],
    popular: (servicos[`packages.${i}.popular`] ?? FALLBACKS[`servicos.packages.${i}.popular`]) === "true",
    features: Array.from({ length: 5 }, (_, j) => servicos[`packages.${i}.features.${j}.text`] ?? FALLBACKS[`servicos.packages.${i}.features.${j}.text`]).filter(Boolean),
    cta: servicos[`packages.${i}.cta`] ?? FALLBACKS[`servicos.packages.${i}.cta`],
    ctaHref: servicos[`packages.${i}.ctaHref`] ?? FALLBACKS[`servicos.packages.${i}.ctaHref`],
  }));

  const cta = {
    title: servicos["cta.title"] ?? FALLBACKS["servicos.cta.title"],
    buttonLabel: servicos["cta.buttonLabel"] ?? FALLBACKS["servicos.cta.buttonLabel"],
    buttonHref: servicos["cta.buttonHref"] ?? FALLBACKS["servicos.cta.buttonHref"],
  };

  return (
    <div>
      {/* Hero */}
      <EditableBackground
        contentKey="servicos.hero.backgroundImage"
        fallback={FALLBACKS["servicos.hero.backgroundImage"] ?? "/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg"}
        overlay="rgba(0,0,0,0.5)"
        className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden bg-on-surface text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <Reveal className="container-site relative z-10 text-center max-w-[920px]">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/80 mb-6">
            {hero.eyebrow}
          </p>
          <EditableText
            contentKey="servicos.hero.title"
            fallback={hero.title}
            tag="h1"
            className="text-display uppercase text-white whitespace-pre-line"
            multiline
          />
        </Reveal>
      </EditableBackground>

      {/* 01 — Método */}
      <section className="relative w-full bg-primary-container text-on-primary-container py-24 md:py-32 overflow-hidden">
        <SectionNumber num="01" />
        <Reveal className="container-site max-w-[960px]">
          <Reveal direction="up" distance={24}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-primary-container/60 mb-8 text-center">
              Como fazemos a diferença
            </p>
          </Reveal>
          <Reveal direction="up" distance={24} delay={100}>
            <EditableText
              contentKey="servicos.methodTitle"
              fallback={methodTitle}
              tag="h2"
              className="text-display text-center mb-6 capitalize"
            />
          </Reveal>
          <Reveal direction="up" distance={24} delay={150}>
            <p className="font-sans text-base md:text-lg font-medium leading-relaxed text-on-primary-container/80 max-w-[640px] mx-auto text-center mb-16">
              Quatro passos para transformar a cultura da sua organização com resultados reais.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {methodSteps.map((step, i) => (
              <Reveal key={i} direction="up" distance={24} delay={200 + i * 80}>
                <div className="text-center">
                  <EditableText
                    contentKey={`servicos.methodSteps.${i}.number`}
                    fallback={step.number}
                    tag="span"
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-on-primary-container/10 text-on-primary-container text-2xl font-bold mb-6 ring-1 ring-on-primary-container/20"
                  />
                  <EditableText
                    contentKey={`servicos.methodSteps.${i}.title`}
                    fallback={step.title}
                    tag="h3"
                    className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
                  />
                  <EditableText
                    contentKey={`servicos.methodSteps.${i}.description`}
                    fallback={step.description}
                    tag="p"
                    className="font-sans text-base font-medium leading-relaxed text-on-primary-container/75 whitespace-pre-line"
                    multiline
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 02 — Pacotes */}
      <section className="relative w-full bg-surface text-on-surface py-24 md:py-32 overflow-hidden">
        <SectionNumber num="02" />
        <Reveal className="container-site">
          <Reveal direction="up" distance={24}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface/60 mb-8 text-center">
              Escolha o seu plano
            </p>
          </Reveal>
          <Reveal direction="up" distance={24} delay={100}>
            <EditableText
              contentKey="servicos.packagesTitle"
              fallback={packagesTitle}
              tag="h2"
              className="text-display text-center mb-16 capitalize"
            />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1100px] mx-auto">
            {packages.map((pkg, i) => (
              <Reveal
                key={pkg.name}
                direction="up"
                distance={24}
                delay={150 + i * 100}
              >
                <div
                  className={`relative flex flex-col h-full p-8 md:p-10 rounded-xl border ${
                    pkg.popular
                      ? "border-primary-container shadow-[0_0_0_1px_#f3a32a]"
                      : "border-on-surface/10"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                      Mais Popular
                    </span>
                  )}
                  <p className="text-sm font-bold uppercase tracking-wider text-primary-container mb-6">
                    {pkg.name}
                  </p>
                  <ul className="space-y-4 mb-10 flex-1">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-primary-container mt-0.5 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                        </svg>
                        <span className="font-sans text-base font-medium leading-relaxed text-on-surface/75">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={pkg.ctaHref}
                    className={`inline-block w-full text-center font-heading font-bold text-base capitalize px-8 py-3 rounded-md transition-opacity hover:opacity-90 ${
                      pkg.popular
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-on-surface text-white"
                    }`}
                  >
                    {pkg.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative w-full bg-on-surface text-white py-[100px] overflow-hidden">
        <Reveal className="container-site flex items-center justify-between gap-8 flex-wrap">
          <Reveal direction="left" distance={32}>
            <EditableText
              contentKey="servicos.cta.title"
              fallback={cta.title}
              tag="h2"
              className="text-display-sm max-w-[720px] whitespace-pre-line"
              multiline
            />
          </Reveal>
          <Reveal direction="right" distance={32} delay={150}>
            <Link
              href={cta.buttonHref}
              className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity shrink-0"
            >
              {cta.buttonLabel}
            </Link>
          </Reveal>
        </Reveal>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Add fallback entry for `servicos.hero.backgroundImage`**

In `src/lib/content-images.ts`, add:

```ts
"servicos.hero.backgroundImage": "/images/sigmund-HKr9cdfrbOo-unsplash-1024x683.jpg",
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/ServicesFlow.tsx src/lib/content-images.ts
git commit -m "feat(cms): make services page editable"
```

---

### Task 15: AboutFlow

**Files:**
- Modify: `src/components/AboutFlow.tsx`

- [ ] **Step 1: Replace `src/components/AboutFlow.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/Reveal";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableText } from "@/components/cms/EditableText";
import { EditableBackground } from "@/components/cms/EditableBackground";

gsap.registerPlugin(ScrollTrigger);

const SectionNumber = ({ num }: { num: string }) => (
  <span className="text-[clamp(6rem,20vw,16rem)] font-bold leading-[0.7] text-on-surface/5 select-none pointer-events-none absolute top-0 right-0 -mt-4 -mr-4 md:-mr-8">
    {num}
  </span>
);

function HorizontalScrollSection({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const scrollWidth = track.scrollWidth - window.innerWidth;
    if (scrollWidth <= 0) return;
    gsap.to(track, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${scrollWidth}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  return (
    <section ref={sectionRef} className="relative bg-surface text-on-surface">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div ref={trackRef} className="flex will-change-transform">
          {children}
        </div>
      </div>
    </section>
  );
}

const journeySteps = [
  { num: "01", title: "Escuta Ativa", body: "Compreendemos a fundo a cultura, os desafios e as pessoas da organização, criando uma base de confiança para todo o processo.", color: "#845400" },
  { num: "02", title: "Diagnóstico", body: "Aplicamos ferramentas validadas para identificar riscos psicossociais, clima organizacional e áreas de oportunidade.", color: "#f3a32a" },
  { num: "03", title: "Devolução", body: "Partilhamos as descobertas com transparência, clareza e sem filtros — porque a mudança começa com a verdade.", color: "#141414" },
  { num: "04", title: "Co-criação", body: "Desenhamos soluções lado a lado com lideranças e equipas, garantindo envolvimento e relevância para o dia a dia.", color: "#845400" },
  { num: "05", title: "Intervenção", body: "Aplicamos programas práticos de bem-estar, formação e desenvolvimento — sempre com foco em ação e não em teoria.", color: "#f3a32a" },
  { num: "06", title: "Avaliação", body: "Medimos o impacto real nas pessoas e nos resultados do negócio, ajustando rotas sempre que necessário.", color: "#141414" },
  { num: "07", title: "Sustentabilidade", body: "Garantimos que as mudanças perduram e evoluem com a organização, criando uma cultura de melhoria contínua.", color: "#845400" },
];

export function AboutFlow() {
  const sobre = useSiteContentSection("sobre");

  const hero = {
    eyebrow: sobre["hero.eyebrow"] ?? FALLBACKS["sobre.hero.eyebrow"],
    title: sobre["hero.title"] ?? FALLBACKS["sobre.hero.title"],
  };

  const quemSomos = {
    title: sobre["quemSomos.title"] ?? FALLBACKS["sobre.quemSomos.title"],
    body: sobre["quemSomos.body"] ?? FALLBACKS["sobre.quemSomos.body"],
  };

  const proposito = { body: sobre["proposito.body"] ?? FALLBACKS["sobre.proposito.body"] };
  const missao = { body: sobre["missao.body"] ?? FALLBACKS["sobre.missao.body"] };
  const visao = { body: sobre["visao.body"] ?? FALLBACKS["sobre.visao.body"] };

  const valoresTitle = sobre["valoresTitle"] ?? FALLBACKS["sobre.valoresTitle"];
  const valores = Array.from({ length: 4 }, (_, i) => ({
    title: sobre[`valores.${i}.title`] ?? FALLBACKS[`sobre.valores.${i}.title`],
    body: sobre[`valores.${i}.body`] ?? FALLBACKS[`sobre.valores.${i}.body`],
  }));

  const comoTrabalhamosTitle = sobre["comoTrabalhamosTitle"] ?? FALLBACKS["sobre.comoTrabalhamosTitle"];
  const comoTrabalhamos = Array.from({ length: 3 }, (_, i) => ({
    title: sobre[`comoTrabalhamos.${i}.title`] ?? FALLBACKS[`sobre.comoTrabalhamos.${i}.title`],
    body: sobre[`comoTrabalhamos.${i}.body`] ?? FALLBACKS[`sobre.comoTrabalhamos.${i}.body`],
  }));

  const diferenciaTitle = sobre["diferenciaTitle"] ?? FALLBACKS["sobre.diferenciaTitle"];
  const diferenciaBody = sobre["diferenciaBody"] ?? FALLBACKS["sobre.diferenciaBody"];
  const diferencia = Array.from({ length: 3 }, (_, i) => ({
    title: sobre[`diferencia.${i}.title`] ?? FALLBACKS[`sobre.diferencia.${i}.title`],
    body: sobre[`diferencia.${i}.body`] ?? FALLBACKS[`sobre.diferencia.${i}.body`],
  }));

  const cta = {
    title: sobre["cta.title"] ?? FALLBACKS["sobre.cta.title"],
    buttonLabel: sobre["cta.buttonLabel"] ?? FALLBACKS["sobre.cta.buttonLabel"],
    buttonHref: sobre["cta.buttonHref"] ?? FALLBACKS["sobre.cta.buttonHref"],
  };

  return (
    <div>
      {/* Hero */}
      <EditableBackground
        contentKey="sobre.hero.backgroundImage"
        fallback={FALLBACKS["sobre.hero.backgroundImage"]}
        overlay="rgba(0,0,0,0.5)"
        className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden bg-on-surface text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <Reveal className="container-site relative z-10 text-center max-w-[920px]">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/80 mb-6">
            {hero.eyebrow}
          </p>
          <EditableText
            contentKey="sobre.hero.title"
            fallback={hero.title}
            tag="h1"
            className="text-display uppercase text-white whitespace-pre-line"
            multiline
          />
        </Reveal>
      </EditableBackground>

      {/* Quem Somos */}
      <section className="relative w-full bg-on-surface text-white py-24 md:py-32 overflow-hidden">
        <SectionNumber num="01" />
        <Reveal direction="none" distance={0} className="container-site max-w-[900px]">
          <Reveal direction="up" distance={24}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-8">Quem Somos</p>
          </Reveal>
          <Reveal direction="left" distance={32} delay={100}>
            <EditableText
              contentKey="sobre.quemSomos.title"
              fallback={quemSomos.title}
              tag="p"
              className="text-display-sm mb-8 whitespace-pre-line"
              multiline
            />
          </Reveal>
          <Reveal direction="up" distance={24} delay={200}>
            <EditableText
              contentKey="sobre.quemSomos.body"
              fallback={quemSomos.body}
              tag="p"
              className="font-sans text-base md:text-lg font-medium leading-[1.7] text-white/85 whitespace-pre-line"
              multiline
            />
          </Reveal>
        </Reveal>
      </section>

      {/* Propósito, Missão & Visão */}
      <section className="relative w-full bg-primary-container text-on-primary-container py-24 md:py-32 overflow-hidden">
        <SectionNumber num="02" />
        <Reveal className="container-site text-center max-w-[960px]">
          <Reveal direction="up" distance={24}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-primary-container/60 mb-8">
              Propósito, Missão & Visão
            </p>
          </Reveal>
          <Reveal direction="none" distance={0} delay={100}>
            <h2 className="text-display mb-16">A Nossa Razão de Ser</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left">
            {[
              { label: "Propósito", body: proposito.body, key: "sobre.proposito.body" },
              { label: "Missão", body: missao.body, key: "sobre.missao.body" },
              { label: "Visão", body: visao.body, key: "sobre.visao.body" },
            ].map((item, i) => (
              <Reveal key={i} direction="up" distance={24} delay={150 + i * 100}>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider mb-4">{item.label}</p>
                  <EditableText
                    contentKey={item.key}
                    fallback={item.body}
                    tag="p"
                    className="font-sans text-base font-medium leading-relaxed text-on-primary-container/80 whitespace-pre-line"
                    multiline
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Jornada — horizontal scroll timeline */}
      <section className="relative bg-surface overflow-hidden">
        <SectionNumber num="03" />
        <div className="pt-24 pb-8 md:pt-32 md:pb-12 text-center container-site">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface/60 mb-6">A Nossa Jornada</p>
          <h2 className="text-display">Como Transformamos Organizações</h2>
        </div>
        <HorizontalScrollSection>
          <div className="flex items-stretch gap-6 md:gap-10 px-[4vw] pt-8 pb-16">
            {journeySteps.map((step, i) => (
              <div key={i} className="w-[75vw] md:w-[38vw] lg:w-[28vw] shrink-0 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0"
                    style={{ backgroundColor: step.color, color: step.color === "#f3a32a" ? "#141414" : "#fff" }}
                  >
                    {step.num}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: step.color }} />
                </div>
                <div
                  className="flex-1 p-6 md:p-8 rounded-xl border"
                  style={{ borderColor: `${step.color}30`, backgroundColor: `${step.color}08` }}
                >
                  <h3 className="text-display-sm mb-3 text-on-surface break-words">{step.title}</h3>
                  <p className="font-sans text-base font-medium leading-relaxed text-on-surface/70 break-words">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </HorizontalScrollSection>
      </section>

      {/* CTA */}
      <section className="relative w-full bg-on-surface text-white py-[100px] overflow-hidden">
        <Reveal className="container-site flex items-center justify-between gap-8 flex-wrap">
          <Reveal direction="left" distance={32}>
            <EditableText
              contentKey="sobre.cta.title"
              fallback={cta.title}
              tag="h2"
              className="text-display-sm max-w-[720px] whitespace-pre-line"
              multiline
            />
          </Reveal>
          <Reveal direction="right" distance={32} delay={150}>
            <Link
              href={cta.buttonHref}
              className="inline-block bg-primary text-primary-foreground font-heading font-bold text-base capitalize px-8 py-3 rounded-md hover:opacity-90 transition-opacity shrink-0"
            >
              {cta.buttonLabel}
            </Link>
          </Reveal>
        </Reveal>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/AboutFlow.tsx
git commit -m "feat(cms): make about page editable"
```

---

### Task 16: PageHero and Contactos page

**Files:**
- Modify: `src/components/PageHero.tsx`
- Modify: `src/app/contactos/page.tsx`

- [ ] **Step 1: Update `src/components/PageHero.tsx`**

```tsx
"use client";

import { Parallax } from "@/components/Parallax";
import { Reveal } from "@/components/Reveal";
import { EditableImage } from "@/components/cms/EditableImage";
import { EditableText } from "@/components/cms/EditableText";

interface PageHeroProps {
  imageKey: string;
  imageFallback: string;
  imageAlt?: string;
  eyebrow?: string;
  titleKey: string;
  titleFallback: string;
}

export function PageHero({ imageKey, imageFallback, imageAlt = "", eyebrow, titleKey, titleFallback }: PageHeroProps) {
  return (
    <section className="relative flex flex-col justify-center items-center w-full min-h-screen overflow-hidden">
      <Parallax strength={0.15} className="absolute inset-0">
        <EditableImage
          contentKey={imageKey}
          fallback={imageFallback}
          alt={imageAlt}
          fill
          className="object-cover"
        />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="container-site relative z-10 text-center">
        <Reveal>
          {eyebrow && (
            <p className="font-sans text-label-caps uppercase tracking-[0.15em] text-white/80 mb-6">
              {eyebrow}
            </p>
          )}
          <EditableText
            contentKey={titleKey}
            fallback={titleFallback}
            tag="h1"
            className="text-display uppercase text-white whitespace-pre-line"
            multiline
          />
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update `src/app/contactos/page.tsx`**

```tsx
"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageHero } from "@/components/PageHero";
import { useSiteContentSection, FALLBACKS } from "@/lib/site-content";
import { EditableText } from "@/components/cms/EditableText";

export default function ContactosPage() {
  const contactos = useSiteContentSection("contactos");

  const emailLines = Array.from({ length: 2 }, (_, i) => contactos[`emailLines.${i}`] ?? FALLBACKS[`contactos.emailLines.${i}`]).filter(Boolean);

  return (
    <div className="hfeed site flex flex-col min-h-screen">
      <SiteHeader />
      <div id="content" className="site-content flex-1">
        <main id="main">
          <article className="entry-content">
            <PageHero
              imageKey="contactos.hero.backgroundImage"
              imageFallback={FALLBACKS["contactos.hero.backgroundImage"]}
              imageAlt="Contacte a HumanUp"
              titleKey="contactos.hero.title"
              titleFallback={contactos["hero.title"] ?? FALLBACKS["contactos.hero.title"]}
            />

            <section className="w-full bg-white py-16">
              <div className="container-site grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <p className="font-sans text-base font-medium text-primary uppercase mb-2">
                    {contactos.eyebrow ?? FALLBACKS["contactos.eyebrow"]}
                  </p>
                  <EditableText
                    contentKey="contactos.title"
                    fallback={contactos.title ?? FALLBACKS["contactos.title"]}
                    tag="h2"
                    className="font-heading text-[46px] font-bold leading-[55.2px] tracking-[-1px] text-foreground capitalize mb-12"
                  />

                  <div className="mb-8">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">Email</h3>
                    <p className="font-sans text-base font-medium leading-[26.4px] text-foreground">
                      {emailLines.map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">Endereço</h3>
                    <EditableText
                      contentKey="contactos.endereco"
                      fallback={contactos.endereco ?? FALLBACKS["contactos.endereco"]}
                      tag="p"
                      className="font-sans text-base font-medium leading-[26.4px] text-foreground whitespace-pre-line"
                      multiline
                    />
                  </div>
                </div>

                <div>
                  <form className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block font-sans text-sm font-medium text-foreground mb-1">Nome *</label>
                        <input type="text" id="name" className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" placeholder="O seu nome" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block font-sans text-sm font-medium text-foreground mb-1">Email *</label>
                        <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" placeholder="O seu email" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block font-sans text-sm font-medium text-foreground mb-1">Assunto</label>
                      <input type="text" id="subject" className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" placeholder="Assunto da mensagem" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block font-sans text-sm font-medium text-foreground mb-1">Mensagem *</label>
                      <textarea id="message" rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-300 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none" placeholder="A sua mensagem" />
                    </div>
                    <button type="submit" className="w-full bg-primary text-primary-foreground font-heading font-bold text-base leading-[25.6px] capitalize px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
                      {contactos.formTitle ?? FALLBACKS["contactos.formTitle"]}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </article>
        </main>
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/PageHero.tsx src/app/contactos/page.tsx
git commit -m "feat(cms): make contact page editable"
```

---

### Task 17: Backoffice /areareservada

**Files:**
- Modify: `src/app/areareservada/page.tsx`

- [ ] **Step 1: Rewrite `src/app/areareservada/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Row = { key: string; value: string; label: string; section: string };

const SECTION_LABELS: Record<string, string> = {
  header: "Cabeçalho",
  footer: "Rodapé",
  home: "Página Inicial",
  servicos: "Página Serviços",
  sobre: "Página Sobre",
  contactos: "Página Contactos",
};

export default function AreaReservadaPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "admin") router.push("/login");
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    fetch("/api/content/admin")
      .then((r) => (r.ok ? (r.json() as Promise<Row[]>) : []))
      .then((data) => {
        setRows(data);
        setValues(Object.fromEntries(data.map((r) => [r.key, r.value])));
      })
      .catch(() => {});
  }, []);

  const handleSave = async (row: Row) => {
    setSaving(row.key);
    const res = await fetch(`/api/content/${encodeURIComponent(row.key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: values[row.key] ?? "" }),
    });
    setSaving(null);
    if (!res.ok) alert("Erro ao guardar");
  };

  const handleReset = async () => {
    if (!confirm("Repor todos os conteúdos para os valores predefinidos? Esta ação não pode ser desfeita.")) return;
    const res = await fetch("/api/content/reset", { method: "POST" });
    if (res.ok) window.location.reload();
    else alert("Erro ao repor predefinições");
  };

  const grouped = rows.reduce<Record<string, Row[]>>((acc, row) => {
    acc[row.section] ??= [];
    acc[row.section].push(row);
    return acc;
  }, {});

  if (loading || !isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">Área Reservada</h1>
            <p className="font-body-sm text-body-sm text-secondary">Edição de conteúdos do site — HumanUp</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="border border-outline text-on-surface font-button text-button px-4 py-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            >
              Repor predefinições
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {Object.keys(grouped).sort().map((section) => {
          const isOpen = open[section] ?? false;
          return (
            <div key={section} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen((prev) => ({ ...prev, [section]: !prev[section] }))}
                className="w-full flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-surface-container transition-colors"
              >
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">
                  {SECTION_LABELS[section] || section}
                </span>
                <span className="material-symbols-outlined text-secondary">
                  {isOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-outline-variant space-y-6">
                  {grouped[section].map((row) => (
                    <div key={row.key} className="space-y-2">
                      <label className="block font-body-sm text-body-sm font-medium text-secondary ml-1">
                        {row.label}
                      </label>
                      <div className="flex gap-2 items-start">
                        {(values[row.key] ?? "").length > 80 ? (
                          <textarea
                            value={values[row.key] ?? ""}
                            onChange={(e) => setValues((prev) => ({ ...prev, [row.key]: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        ) : (
                          <input
                            type="text"
                            value={values[row.key] ?? ""}
                            onChange={(e) => setValues((prev) => ({ ...prev, [row.key]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleSave(row)}
                          disabled={saving === row.key}
                          className={cn(
                            "px-4 py-2 bg-primary text-on-primary rounded-lg font-button text-button hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0",
                            saving === row.key && "opacity-50"
                          )}
                        >
                          {saving === row.key ? "..." : "Guardar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/app/areareservada/page.tsx
git commit -m "feat(cms): rewrite backoffice as grouped key-value editor"
```

---

### Task 18: Cleanup and final validation

**Files:**
- Delete: `src/lib/content-store.tsx`
- Modify: any remaining imports of `@/lib/content-store`.

- [ ] **Step 1: Delete `src/lib/content-store.tsx`**

```bash
rm src/lib/content-store.tsx
```

- [ ] **Step 2: Search for leftover imports**

```bash
grep -r "@/lib/content-store" src/ || echo "No leftover imports"
```

Expected: no results.

- [ ] **Step 3: Run lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both pass.

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 5: Manual smoke tests**

Start the dev server:

```bash
npm run dev
```

Then:

1. Login as admin at `http://localhost:3000/login`.
2. Confirm the `HumanUp Admin` bar appears at the bottom of every page.
3. Click "Ativar Edição".
4. On the homepage, edit `home.hero.title`, press Enter, refresh — change persists.
5. On `/contactos`, edit `contactos.title` inline and confirm persistence.
6. Upload a new image for `home.hero.backgroundImage`, refresh, confirm new background.
7. Visit `/areareservada`, edit a field, save, confirm it appears updated on the site.
8. Click "Repor predefinições", confirm content reverts to defaults.

- [ ] **Step 6: Commit cleanup**

```bash
git rm src/lib/content-store.tsx
git add .
git commit -m "feat(cms): remove legacy content store and finalize inline CMS"
```

---

## Spec coverage check

| Spec requirement | Task(s) |
|------------------|---------|
| Key-value table `site_content(key, value, label, section)` | Task 2 |
| Migration from old JSONB row | Task 2 |
| Public GET `/api/content` | Task 3 |
| Admin GET/PUT/upload/reset routes | Task 3 |
| `SiteContentProvider` + hooks | Task 4 |
| `EditableText` inline | Task 5 |
| `EditableImage` inline | Task 6 |
| `EditableBackground` inline | Task 7 |
| `AdminBar` | Task 8 |
| Update landing-page components | Tasks 9–16 |
| Rewrite `/areareservada` | Task 17 |
| Plain text + line breaks, no HTML | Tasks 1, 10–16 (whitespace-pre-line) |
| Final validation | Task 18 |

## Placeholder scan

No TBD/TODO/fill-in-details found. Every task includes exact file paths, code blocks, and test commands.

## Type consistency check

- `useSiteContent(key, fallback)` returns `string` — used consistently.
- `useSiteContentSection(prefix)` returns `Record<string, string>` — used to reconstruct arrays.
- `useSiteContentContext()` returns `{ content, loading, editMode, setEditMode, saveContent }` — consumed by CMS components.
- API route params awaited as `Promise<{ key: string }>` consistent with Next.js 16 App Router.
