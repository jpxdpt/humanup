import "server-only";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { DEFAULT_CONTENT } from "./content-schema";

function generateAccessCode(): string {
  return randomBytes(9).toString("hex").toUpperCase();
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set.`);
  }
  return value;
}

declare global {
  // eslint-disable-next-line no-var
  var __humanupPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __humanupReady: Promise<void> | undefined;
}

function getPool(): Pool {
  if (!globalThis.__humanupPool) {
    const connectionString = requireEnv("POSTGRES_URL");
    const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
    globalThis.__humanupPool = new Pool({
      connectionString,
      ssl: isLocal ? undefined : true,
    });
  }
  return globalThis.__humanupPool;
}

async function migrate(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      cargo TEXT DEFAULT '',
      tel TEXT DEFAULT '',
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS empresas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      nif TEXT NOT NULL UNIQUE,
      pacote TEXT DEFAULT 'Essencial',
      ncolab INTEGER DEFAULT 0,
      estado TEXT DEFAULT 'ativo',
      ceo_nome TEXT NOT NULL,
      ceo_email TEXT NOT NULL UNIQUE,
      ceo_cargo TEXT DEFAULT '',
      ceo_tel TEXT DEFAULT '',
      ceo_password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS colaboradores (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      email TEXT DEFAULT '',
      nif TEXT NOT NULL UNIQUE,
      access_code_hash TEXT NOT NULL,
      departamento TEXT DEFAULT '',
      cargo TEXT DEFAULT '',
      estado TEXT DEFAULT 'ativo'
    );

    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL
    );
  `);

  const adminCount = await pool.query("SELECT COUNT(*) FROM admins");
  if (Number(adminCount.rows[0].count) === 0) {
    const email = requireEnv("ADMIN_EMAIL");
    const password = requireEnv("ADMIN_PASSWORD");
    const hash = bcrypt.hashSync(password, 10);
    await pool.query(
      "INSERT INTO admins (id, nome, email, cargo, tel, password_hash) VALUES ($1, $2, $3, $4, $5, $6)",
      ["admin-1", process.env.ADMIN_NAME || "Administrador", email, "Administrador", "", hash]
    );
    console.log(`[seed] Admin criado: ${email}`);
  }

  const empresaCount = await pool.query("SELECT COUNT(*) FROM empresas");
  if (Number(empresaCount.rows[0].count) === 0) {
    const seedEmpresas = [
      { id: "emp-1", nome: "Tech Solutions Lda", nif: "500123456", pacote: "GO-UP", ncolab: 3, estado: "ativo", ceoNome: "Maria João Ferreira", ceoEmail: "mjferreira@techsolutions.pt", ceoCargo: "CEO", ceoTel: "+351 912 345 678", pass: "hup123" },
      { id: "emp-2", nome: "Saúde Plus SA", nif: "500654321", pacote: "GROW-UP", ncolab: 2, estado: "ativo", ceoNome: "Pedro Santos", ceoEmail: "psantos@saudeplus.pt", ceoCargo: "Diretor Geral", ceoTel: "+351 913 456 789", pass: "hup456" },
      { id: "emp-3", nome: "InnovaTech", nif: "500789123", pacote: "START-UP", ncolab: 1, estado: "inativo", ceoNome: "Ana Costa", ceoEmail: "acosta@innovatech.pt", ceoCargo: "CEO", ceoTel: "+351 914 567 890", pass: "hup789" },
    ];
    for (const e of seedEmpresas) {
      await pool.query(
        "INSERT INTO empresas (id, nome, nif, pacote, ncolab, estado, ceo_nome, ceo_email, ceo_cargo, ceo_tel, ceo_password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
        [e.id, e.nome, e.nif, e.pacote, e.ncolab, e.estado, e.ceoNome, e.ceoEmail, e.ceoCargo, e.ceoTel, bcrypt.hashSync(e.pass, 10)]
      );
    }
  }

  const colabCount = await pool.query("SELECT COUNT(*) FROM colaboradores");
  if (Number(colabCount.rows[0].count) === 0) {
    const seedColaboradores = [
      { id: "col-1", empresaId: "emp-1", nome: "João Silva", email: "jsilva@techsolutions.pt", nif: "123456789", departamento: "Tecnologia", cargo: "Desenvolvedor" },
      { id: "col-2", empresaId: "emp-1", nome: "Maria Costa", email: "mcosta@techsolutions.pt", nif: "234567890", departamento: "Comercial", cargo: "Account Manager" },
      { id: "col-3", empresaId: "emp-1", nome: "Rui Mendes", email: "rmendes@techsolutions.pt", nif: "345678901", departamento: "Recursos Humanos", cargo: "RH Generalista" },
      { id: "col-4", empresaId: "emp-2", nome: "Carla Sousa", email: "csousa@saudeplus.pt", nif: "456789012", departamento: "Clínica", cargo: "Enfermeira" },
      { id: "col-5", empresaId: "emp-2", nome: "Miguel Oliveira", email: "moliveira@saudeplus.pt", nif: "567890123", departamento: "Administrativo", cargo: "Rececionista" },
    ];
    console.log("[seed] Códigos de acesso de colaborador (normalmente enviados por email):");
    for (const c of seedColaboradores) {
      const code = generateAccessCode();
      await pool.query(
        "INSERT INTO colaboradores (id, empresa_id, nome, email, nif, access_code_hash, departamento, cargo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [c.id, c.empresaId, c.nome, c.email, c.nif, bcrypt.hashSync(code, 10), c.departamento, c.cargo]
      );
      console.log(`  ${c.nome} (NIF ${c.nif}): ${code}`);
    }
  }

  const contentRow = await pool.query("SELECT id FROM site_content WHERE id = 1");
  if (contentRow.rowCount === 0) {
    await pool.query("INSERT INTO site_content (id, data) VALUES (1, $1)", [JSON.stringify(DEFAULT_CONTENT)]);
  }
}

export async function getDb(): Promise<Pool> {
  const pool = getPool();
  if (!globalThis.__humanupReady) {
    globalThis.__humanupReady = migrate(pool).catch((err) => {
      globalThis.__humanupReady = undefined;
      throw err;
    });
  }
  await globalThis.__humanupReady;
  return pool;
}
