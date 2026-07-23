import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED = ["pdf", "docx", "xlsx", "pptx", "csv"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "Nenhum ficheiro enviado" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED.includes(ext)) return NextResponse.json({ success: false, error: "Formato não permitido. Use: PDF, DOCX, XLSX, PPTX ou CSV" }, { status: 400 });

    if (file.size > MAX_SIZE) return NextResponse.json({ success: false, error: "Ficheiro demasiado grande. Máx 10MB" }, { status: 400 });

    const dir = join(process.cwd(), "public", "documents");
    await mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const path = join(dir, name);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path, buf);

    return NextResponse.json({ success: true, url: `/documents/${name}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
