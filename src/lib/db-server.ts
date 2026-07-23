import "server-only";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { DEFAULT_CONTENT } from "./content-schema";
import { flattenContent, humanizeKey } from "./content-utils";
import { DEFAULT_IMAGE_KEYS } from "./content-images";

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
    const isLocal = /localhost|127\.0\.0\.1|::1|db/.test(connectionString);
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
      localizacao TEXT DEFAULT '',
      departamento TEXT DEFAULT '',
      cargo TEXT DEFAULT '',
      estado TEXT DEFAULT 'ativo'
    );
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'colaboradores' AND column_name = 'localizacao') THEN
        ALTER TABLE colaboradores ADD COLUMN localizacao TEXT DEFAULT '';
      END IF;
    END
    $$`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      label TEXT NOT NULL,
      section TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      role TEXT DEFAULT 'admin',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS faturas (
      id SERIAL PRIMARY KEY, empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      empresa_nome TEXT DEFAULT '', referencia TEXT DEFAULT '', valor DECIMAL(10,2) DEFAULT 0,
      data_emissao DATE DEFAULT CURRENT_DATE, vencimento DATE, estado TEXT DEFAULT 'pendente',
      descricao TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS questionarios (
      id TEXT PRIMARY KEY, titulo TEXT NOT NULL, tipo TEXT DEFAULT 'outro', badge TEXT DEFAULT '',
      estado TEXT DEFAULT 'ativo', perguntas JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS envios (
      id TEXT PRIMARY KEY, empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      quest_id TEXT NOT NULL REFERENCES questionarios(id) ON DELETE CASCADE,
      codigo TEXT NOT NULL, estado TEXT DEFAULT 'aberto', total_colabs INTEGER DEFAULT 0,
      respostas INTEGER DEFAULT 0, data_envio TIMESTAMPTZ DEFAULT now(), data_limite TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS mensagens (
      id SERIAL PRIMARY KEY, empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      de TEXT NOT NULL DEFAULT 'admin', texto TEXT NOT NULL DEFAULT '', anexos JSONB DEFAULT '[]',
      lida BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS documentos (
      id SERIAL PRIMARY KEY, tipo TEXT NOT NULL DEFAULT 'PDF', nome TEXT NOT NULL,
      descricao TEXT DEFAULT '', url TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS pacotes (
      id TEXT PRIMARY KEY, nome TEXT NOT NULL, descricao TEXT DEFAULT '', preco TEXT DEFAULT '€ 0'
    );
    CREATE TABLE IF NOT EXISTS dimensoes (
      id SERIAL PRIMARY KEY, nome TEXT NOT NULL UNIQUE, cor TEXT DEFAULT 'gold',
      icone TEXT DEFAULT '\u{1F49B}', descricao TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS respostas_anonimas (
      id SERIAL PRIMARY KEY, envio_id TEXT REFERENCES envios(id) ON DELETE CASCADE,
      texto TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS envio_destinatarios (
      id SERIAL PRIMARY KEY, envio_id TEXT NOT NULL REFERENCES envios(id) ON DELETE CASCADE,
      colaborador_id TEXT NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
      respondido BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(envio_id, colaborador_id)
    );
    CREATE TABLE IF NOT EXISTS respostas (
      id SERIAL PRIMARY KEY, envio_id TEXT, colaborador_id TEXT NOT NULL,
      empresa_id TEXT NOT NULL, quest_ref TEXT DEFAULT '',
      respostas JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(envio_id, colaborador_id)
    );
    ALTER TABLE envios DROP CONSTRAINT IF EXISTS envios_codigo_key;
  `);

  await pool.query("ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS localizacao TEXT DEFAULT ''");

  const oldTable = await pool.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_content' AND column_name = 'data'
  `);

  if (Number(oldTable.rowCount) > 0) {
    await pool.query("ALTER TABLE site_content RENAME TO site_content_legacy");
    await pool.query(`
      CREATE TABLE site_content (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        label TEXT NOT NULL,
        section TEXT NOT NULL
      );
    `);

    const legacy = await pool.query<{ data: unknown }>(
      "SELECT data FROM site_content_legacy WHERE id = 1"
    );
    if (legacy.rowCount && legacy.rowCount > 0) {
      const items = flattenContent(legacy.rows[0].data);
      for (const item of items) {
        await pool.query(
          "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING",
          [item.key, item.value, item.label, item.section]
        );
      }
    }

    await pool.query("DROP TABLE IF EXISTS site_content_legacy");
  }

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
  } else {
    const hash = bcrypt.hashSync(requireEnv("ADMIN_PASSWORD"), 10);
    await pool.query(
      "UPDATE admins SET password_hash = $1 WHERE id = 'admin-1'",
      [hash]
    );
    console.log("[seed] Admin password synced with env var");
  }

  const contentCount = await pool.query("SELECT COUNT(*) FROM site_content");
  if (Number(contentCount.rows[0].count) === 0) {
    const items = flattenContent(DEFAULT_CONTENT);
    for (const item of items) {
      await pool.query(
        "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4)",
        [item.key, item.value, item.label, item.section]
      );
    }
    for (const [key, value] of Object.entries(DEFAULT_IMAGE_KEYS)) {
      await pool.query(
        "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4)",
        [key, value, humanizeKey(key), key.split(".")[0] || "imagens"]
      );
    }
    console.log("[seed] site_content populated");
  } else {
    const items = flattenContent(DEFAULT_CONTENT);
    for (const item of items) {
      await pool.query(
        "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING",
        [item.key, item.value, item.label, item.section]
      );
    }
    for (const [key, value] of Object.entries(DEFAULT_IMAGE_KEYS)) {
      await pool.query(
        "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING",
        [key, value, humanizeKey(key), key.split(".")[0] || "imagens"]
      );
    }
    console.log("[seed] site_content new keys inserted");
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
