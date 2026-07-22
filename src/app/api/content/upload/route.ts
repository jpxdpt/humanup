import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { put } from "@vercel/blob";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";
import { humanizeKey } from "@/lib/content-utils";
import { fileTypeFromBuffer } from "file-type";

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

  const buffer = Buffer.from(await file.arrayBuffer());

  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !fileType.mime.startsWith("image/")) {
    return NextResponse.json({ error: "Tipo de ficheiro inválido" }, { status: 400 });
  }

  const ext = fileType.ext;
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

  let url: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, buffer, { access: "public" });
    url = blob.url;
  } else {
    console.warn(
      "BLOB_READ_WRITE_TOKEN not set — falling back to local filesystem"
    );
    const uploadDir = join(process.cwd(), "public", "images", "content");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    url = `/images/content/${filename}`;
  }
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
