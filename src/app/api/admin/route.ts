import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db-server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    const db = await getDb();

    switch (action) {
      // --- Questionários ---
      case "questionario_list": {
        const result = await db.query("SELECT * FROM questionarios ORDER BY created_at DESC");
        return NextResponse.json({ success: true, data: result.rows });
      }
      case "questionario_insert": {
        const { titulo, tipo, badge, perguntas } = body;
        const id = randomUUID();
        await db.query(
          "INSERT INTO questionarios (id, titulo, tipo, badge, estado, perguntas) VALUES ($1, $2, $3, $4, $5, $6)",
          [id, titulo, tipo || "outro", badge || "", "ativo", JSON.stringify(perguntas || [])]
        );
        return NextResponse.json({ success: true, id });
      }
      case "questionario_update": {
        const { id, titulo, tipo, badge, estado, perguntas } = body;
        const sets: string[] = [];
        const params: unknown[] = [];
        let idx = 1;
        if (titulo !== undefined) { sets.push(`titulo = $${idx++}`); params.push(titulo); }
        if (tipo !== undefined) { sets.push(`tipo = $${idx++}`); params.push(tipo); }
        if (badge !== undefined) { sets.push(`badge = $${idx++}`); params.push(badge); }
        if (estado !== undefined) { sets.push(`estado = $${idx++}`); params.push(estado); }
        if (perguntas !== undefined) { sets.push(`perguntas = $${idx++}`); params.push(JSON.stringify(perguntas)); }
        sets.push(`updated_at = now()`);
        params.push(id);
        await db.query(`UPDATE questionarios SET ${sets.join(", ")} WHERE id = $${idx}`, params);
        return NextResponse.json({ success: true });
      }
      case "questionario_delete": {
        await db.query("DELETE FROM questionarios WHERE id = $1", [body.id]);
        return NextResponse.json({ success: true });
      }
      case "questionario_get": {
        const result = await db.query("SELECT * FROM questionarios WHERE id = $1", [body.id]);
        return NextResponse.json({ success: true, data: result.rows[0] || null });
      }

      // --- Envios ---
      case "envio_list": {
        const result = await db.query(`
          SELECT e.*, emp.nome AS empresa_nome, q.titulo AS quest_nome
          FROM envios e
          LEFT JOIN empresas emp ON e.empresa_id = emp.id
          LEFT JOIN questionarios q ON e.quest_id = q.id
          ORDER BY e.data_envio DESC
        `);
        const envios = result.rows;
        for (const env of envios) {
          const dest = await db.query(
            `SELECT ed.*, c.nome, c.email, c.departamento, c.localizacao, c.cargo
             FROM envio_destinatarios ed
             JOIN colaboradores c ON ed.colaborador_id = c.id
             WHERE ed.envio_id = $1 ORDER BY c.nome`,
            [env.id]
          );
          env.destinatarios = dest.rows;
        }
        return NextResponse.json({ success: true, data: envios });
      }
      case "envio_insert": {
        const { empresa_id, quest_id, codigo, data_limite, colaborador_ids } = body;
        const id = randomUUID();

        let destIds: string[] = colaborador_ids || [];
        if (!destIds.length) {
          const colabs = await db.query("SELECT id FROM colaboradores WHERE empresa_id = $1 AND estado = 'ativo'", [empresa_id]);
          destIds = colabs.rows.map((c: { id: string }) => c.id);
        }

        await db.query(
          "INSERT INTO envios (id, empresa_id, quest_id, codigo, total_colabs, data_limite) VALUES ($1, $2, $3, $4, $5, $6)",
          [id, empresa_id, quest_id, codigo, destIds.length, data_limite || null]
        );

        for (const cid of destIds) {
          await db.query("INSERT INTO envio_destinatarios (envio_id, colaborador_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [id, cid]);
        }

        return NextResponse.json({ success: true, id });
      }
      case "envio_reenviar": {
        const original = await db.query("SELECT * FROM envios WHERE id = $1", [body.id]);
        const env = original.rows[0];
        if (!env) return NextResponse.json({ success: false, error: "Envio nao encontrado" });
        const id = randomUUID();
        await db.query(
          "INSERT INTO envios (id, empresa_id, quest_id, codigo, total_colabs, data_limite) VALUES ($1, $2, $3, $4, $5, $6)",
          [id, env.empresa_id, env.quest_id, env.codigo, env.total_colabs, env.data_limite]
        );
        const dest = await db.query("SELECT colaborador_id FROM envio_destinatarios WHERE envio_id = $1", [env.id]);
        for (const d of dest.rows) {
          await db.query("INSERT INTO envio_destinatarios (envio_id, colaborador_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [id, d.colaborador_id]);
        }
        return NextResponse.json({ success: true, id });
      }
      case "envio_delete": {
        await db.query("DELETE FROM envios WHERE id = $1", [body.id]);
        return NextResponse.json({ success: true });
      }

      // --- Mensagens ---
      case "mensagem_list": {
        const result = await db.query(
          "SELECT * FROM mensagens WHERE empresa_id = $1 ORDER BY created_at ASC",
          [body.empresa_id]
        );
        return NextResponse.json({ success: true, data: result.rows });
      }
      case "mensagem_insert": {
        const { empresa_id, de, texto, anexos } = body;
        await db.query(
          "INSERT INTO mensagens (empresa_id, de, texto, anexos) VALUES ($1, $2, $3, $4)",
          [empresa_id, de || "admin", texto || "", JSON.stringify(anexos || [])]
        );
        return NextResponse.json({ success: true });
      }
      case "mensagem_mark_read": {
        await db.query(
          "UPDATE mensagens SET lida = true WHERE empresa_id = $1 AND de = 'ceo'",
          [body.empresa_id]
        );
        return NextResponse.json({ success: true });
      }
      case "mensagem_unread_count": {
        const result = await db.query(
          "SELECT COUNT(*) FROM mensagens WHERE lida = false AND de = 'ceo'"
        );
        return NextResponse.json({ success: true, count: parseInt(result.rows[0].count) });
      }

      // --- Documentos ---
      case "documento_list": {
        const result = await db.query("SELECT * FROM documentos ORDER BY created_at DESC");
        return NextResponse.json({ success: true, data: result.rows });
      }
      case "documento_insert": {
        const { tipo, nome, descricao, url } = body;
        await db.query(
          "INSERT INTO documentos (tipo, nome, descricao, url) VALUES ($1, $2, $3, $4)",
          [tipo || "PDF", nome, descricao || "", url || ""]
        );
        return NextResponse.json({ success: true });
      }
      case "documento_delete": {
        await db.query("DELETE FROM documentos WHERE id = $1", [body.id]);
        return NextResponse.json({ success: true });
      }

      // --- Pacotes ---
      case "pacote_list": {
        const result = await db.query("SELECT * FROM pacotes ORDER BY id");
        return NextResponse.json({ success: true, data: result.rows });
      }
      case "pacote_upsert": {
        const { id, nome, descricao, preco } = body;
        await db.query(
          "INSERT INTO pacotes (id, nome, descricao, preco) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, descricao = EXCLUDED.descricao, preco = EXCLUDED.preco",
          [id, nome, descricao || "", preco || "€ 0"]
        );
        return NextResponse.json({ success: true });
      }
      case "pacote_delete": {
        await db.query("DELETE FROM pacotes WHERE id = $1", [body.id]);
        return NextResponse.json({ success: true });
      }

      // --- Dimensões ---
      case "dimensao_list": {
        const result = await db.query("SELECT * FROM dimensoes ORDER BY id");
        return NextResponse.json({ success: true, data: result.rows });
      }
      case "dimensao_insert": {
        const { nome, cor, icone, descricao } = body;
        await db.query(
          "INSERT INTO dimensoes (nome, cor, icone, descricao) VALUES ($1, $2, $3, $4) ON CONFLICT (nome) DO UPDATE SET cor = EXCLUDED.cor, icone = EXCLUDED.icone, descricao = EXCLUDED.descricao",
          [nome, cor || "gold", icone || "💛", descricao || ""]
        );
        return NextResponse.json({ success: true });
      }
      case "dimensao_delete": {
        await db.query("DELETE FROM dimensoes WHERE id = $1", [body.id]);
        return NextResponse.json({ success: true });
      }

      // --- Admin Profile ---
      case "admin_list": {
        const result = await db.query("SELECT id, nome, email, cargo, tel FROM admins ORDER BY nome");
        return NextResponse.json({ success: true, data: result.rows });
      }
      case "admin_update": {
        const { id, nome, email, password } = body;
        if (password) {
          const hash = bcrypt.hashSync(password, 10);
          await db.query("UPDATE admins SET nome = $1, email = $2, password_hash = $3 WHERE id = $4", [nome, email, hash, id]);
        } else {
          await db.query("UPDATE admins SET nome = $1, email = $2 WHERE id = $3", [nome, email, id]);
        }
        return NextResponse.json({ success: true });
      }

      // --- Colaborador Import ---
      case "colaborador_list": {
        const { empresa_id, localizacao, departamento, estado } = body;
        const filters: string[] = ["empresa_id = $1"];
        const params: unknown[] = [empresa_id];
        let idx = 2;
        if (localizacao) { filters.push(`localizacao = $${idx++}`); params.push(localizacao); }
        if (departamento) { filters.push(`departamento = $${idx++}`); params.push(departamento); }
        if (estado) { filters.push(`estado = $${idx++}`); params.push(estado); }
        const result = await db.query(
          `SELECT * FROM colaboradores WHERE ${filters.join(" AND ")} ORDER BY nome`,
          params
        );
        return NextResponse.json({ success: true, data: result.rows });
      }
      case "colaborador_import": {
        const { empresa_id, colaboradores } = body;
        const results: { nome: string; nif: string; success: boolean; codigo?: string; error?: string }[] = [];
        for (const col of colaboradores) {
          try {
            const id = randomUUID();
            const code = randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase();
            const hash = bcrypt.hashSync(code, 10);
            await db.query(
              "INSERT INTO colaboradores (id, empresa_id, nome, email, nif, access_code_hash, localizacao, departamento, cargo, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
              [id, empresa_id, col.nome, col.email || "", col.nif, hash, col.localizacao || "", col.departamento || "", col.cargo || "", "ativo"]
            );
            await db.query("UPDATE empresas SET ncolab = ncolab + 1 WHERE id = $1", [empresa_id]);
            results.push({ nome: col.nome, nif: col.nif, success: true, codigo: code });
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Erro desconhecido";
            results.push({ nome: col.nome, nif: col.nif, success: false, error: msg });
          }
        }
        return NextResponse.json({ success: true, results });
      }

      // --- Empresas CRUD ---
      case "empresa_list": {
        const result = await db.query("SELECT * FROM empresas ORDER BY nome");
        return NextResponse.json({ success: true, data: result.rows });
      }
      case "empresa_insert": {
        const { nome, nif, pacote, estado, ceo_nome, ceo_email, ceo_cargo, ceo_tel, ceo_password } = body;
        const id = randomUUID();
        const hash = bcrypt.hashSync(ceo_password || "hup123", 10);
        await db.query(
          "INSERT INTO empresas (id, nome, nif, pacote, ncolab, estado, ceo_nome, ceo_email, ceo_cargo, ceo_tel, ceo_password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
          [id, nome, nif, pacote || "Essencial", 0, estado || "ativo", ceo_nome, ceo_email, ceo_cargo || "", ceo_tel || "", hash]
        );
        return NextResponse.json({ success: true, id });
      }
      case "empresa_update": {
        const { id, nome, nif, pacote, estado, ceo_nome, ceo_email, ceo_cargo, ceo_tel, ceo_password } = body;
        if (ceo_password) {
          const hash = bcrypt.hashSync(ceo_password, 10);
          await db.query(
            "UPDATE empresas SET nome=$1, nif=$2, pacote=$3, estado=$4, ceo_nome=$5, ceo_email=$6, ceo_cargo=$7, ceo_tel=$8, ceo_password_hash=$9 WHERE id=$10",
            [nome, nif, pacote, estado, ceo_nome, ceo_email, ceo_cargo, ceo_tel, hash, id]
          );
        } else {
          await db.query(
            "UPDATE empresas SET nome=$1, nif=$2, pacote=$3, estado=$4, ceo_nome=$5, ceo_email=$6, ceo_cargo=$7, ceo_tel=$8 WHERE id=$9",
            [nome, nif, pacote, estado, ceo_nome, ceo_email, ceo_cargo, ceo_tel, id]
          );
        }
        return NextResponse.json({ success: true });
      }
      case "empresa_delete": {
        await db.query("DELETE FROM empresas WHERE id = $1", [body.id]);
        return NextResponse.json({ success: true });
      }

      // --- Colaborador List (with filters) ---
      case "colaborador_list": {
        const { empresa_id, localizacao, departamento } = body;
        let sql = "SELECT * FROM colaboradores WHERE empresa_id = $1";
        const params: unknown[] = [empresa_id];
        let idx = 2;
        if (localizacao) { sql += ` AND localizacao = $${idx++}`; params.push(localizacao); }
        if (departamento) { sql += ` AND departamento = $${idx++}`; params.push(departamento); }
        sql += " ORDER BY nome";
        const result = await db.query(sql, params);
        return NextResponse.json({ success: true, data: result.rows });
      }

      // --- Dashboard Admin Stats ---
      case "dashboard_admin": {
        const empresasResult = await db.query("SELECT COUNT(*) FROM empresas");
        const colabsResult = await db.query("SELECT COUNT(*) FROM colaboradores");
        const enviosResult = await db.query("SELECT COUNT(*) FROM envios");
        const empresasAtivas = await db.query("SELECT COUNT(*) FROM empresas WHERE estado = 'ativo'");
        return NextResponse.json({
          success: true,
          data: {
            totalEmpresas: parseInt(empresasResult.rows[0].count),
            empresasAtivas: parseInt(empresasAtivas.rows[0].count),
            totalColaboradores: parseInt(colabsResult.rows[0].count),
            totalEnvios: parseInt(enviosResult.rows[0].count),
            faturasPendentes: 0,
            totalPorReceber: 0,
          },
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Ação desconhecida: ${action}` });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
