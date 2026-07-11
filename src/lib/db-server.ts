import "server-only";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { DEFAULT_CONTENT } from "./content-schema";

const dbPath = path.join(process.cwd(), "data", "humanup.db");

declare global {
  // eslint-disable-next-line no-var
  var __humanupDb: Database.Database | undefined;
}

function migrate(db: Database.Database) {
  db.pragma("journal_mode = WAL");

  db.exec(`
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
      departamento TEXT DEFAULT '',
      cargo TEXT DEFAULT '',
      estado TEXT DEFAULT 'ativo'
    );

    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL
    );
  `);

  const adminCount = (db.prepare("SELECT COUNT(*) as c FROM admins").get() as { c: number }).c;
  if (adminCount === 0) {
    const hash = bcrypt.hashSync("dcup2026", 10);
    db.prepare(
      "INSERT INTO admins (id, nome, email, cargo, tel, password_hash) VALUES (?, ?, ?, ?, ?, ?)"
    ).run("admin-1", "Diogo Coelho", "dcoelho@humanup.pt", "Administrador", "+351 912 345 678", hash);
  }

  const empresaCount = (db.prepare("SELECT COUNT(*) as c FROM empresas").get() as { c: number }).c;
  if (empresaCount === 0) {
    const seedEmpresas = [
      { id: "emp-1", nome: "Tech Solutions Lda", nif: "500123456", pacote: "GO-UP", ncolab: 3, estado: "ativo", ceoNome: "Maria João Ferreira", ceoEmail: "mjferreira@techsolutions.pt", ceoCargo: "CEO", ceoTel: "+351 912 345 678", pass: "hup123" },
      { id: "emp-2", nome: "Saúde Plus SA", nif: "500654321", pacote: "GROW-UP", ncolab: 2, estado: "ativo", ceoNome: "Pedro Santos", ceoEmail: "psantos@saudeplus.pt", ceoCargo: "Diretor Geral", ceoTel: "+351 913 456 789", pass: "hup456" },
      { id: "emp-3", nome: "InnovaTech", nif: "500789123", pacote: "START-UP", ncolab: 1, estado: "inativo", ceoNome: "Ana Costa", ceoEmail: "acosta@innovatech.pt", ceoCargo: "CEO", ceoTel: "+351 914 567 890", pass: "hup789" },
    ];
    const insertEmpresa = db.prepare(
      "INSERT INTO empresas (id, nome, nif, pacote, ncolab, estado, ceo_nome, ceo_email, ceo_cargo, ceo_tel, ceo_password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const e of seedEmpresas) {
      insertEmpresa.run(e.id, e.nome, e.nif, e.pacote, e.ncolab, e.estado, e.ceoNome, e.ceoEmail, e.ceoCargo, e.ceoTel, bcrypt.hashSync(e.pass, 10));
    }
  }

  const colabCount = (db.prepare("SELECT COUNT(*) as c FROM colaboradores").get() as { c: number }).c;
  if (colabCount === 0) {
    const seedColaboradores = [
      { id: "col-1", empresaId: "emp-1", nome: "João Silva", email: "jsilva@techsolutions.pt", nif: "123456789", departamento: "Tecnologia", cargo: "Desenvolvedor" },
      { id: "col-2", empresaId: "emp-1", nome: "Maria Costa", email: "mcosta@techsolutions.pt", nif: "234567890", departamento: "Comercial", cargo: "Account Manager" },
      { id: "col-3", empresaId: "emp-1", nome: "Rui Mendes", email: "rmendes@techsolutions.pt", nif: "345678901", departamento: "Recursos Humanos", cargo: "RH Generalista" },
      { id: "col-4", empresaId: "emp-2", nome: "Carla Sousa", email: "csousa@saudeplus.pt", nif: "456789012", departamento: "Clínica", cargo: "Enfermeira" },
      { id: "col-5", empresaId: "emp-2", nome: "Miguel Oliveira", email: "moliveira@saudeplus.pt", nif: "567890123", departamento: "Administrativo", cargo: "Rececionista" },
    ];
    const insertColab = db.prepare(
      "INSERT INTO colaboradores (id, empresa_id, nome, email, nif, departamento, cargo) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const c of seedColaboradores) {
      insertColab.run(c.id, c.empresaId, c.nome, c.email, c.nif, c.departamento, c.cargo);
    }
  }

  const contentRow = db.prepare("SELECT id FROM site_content WHERE id = 1").get();
  if (!contentRow) {
    db.prepare("INSERT INTO site_content (id, data) VALUES (1, ?)").run(JSON.stringify(DEFAULT_CONTENT));
  }
}

export function getDb(): Database.Database {
  if (!globalThis.__humanupDb) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    const db = new Database(dbPath);
    migrate(db);
    globalThis.__humanupDb = db;
  }
  return globalThis.__humanupDb;
}
