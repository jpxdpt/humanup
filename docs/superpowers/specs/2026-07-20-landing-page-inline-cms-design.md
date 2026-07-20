# Design: CMS inline para a landing page do HumanUp

## Data

2026-07-20

## Status

Aprovado pelo utilizador.

## Contexto

O HumanUp usa atualmente um "mini-CMS" caseiro baseado numa única linha JSONB na tabela `site_content`. O backoffice `/areareservada` apresenta um editor recursivo genérico que expõe tags HTML (`<br>`, `<strong>`) como texto cru, o que não é intuitivo para utilizadores não técnicos.

O projeto `/home/jp/Documents/Quirqui` demonstra uma abordagem mais simples e direta:

- Conteúdo guardado em tabela `key-value` (`key`, `value`, `label`, `section`).
- Edição inline diretamente na página pública através de componentes `EditableText` e `EditableImage`.
- Uma barra de admin fixa que ativa/desativa o modo edição.
- Backoffice `/admin/content` com campos agrupados por secção.

## Objetivo

Adaptar o HumanUp a um modelo semelhante ao Quirqui, mantendo a stack atual (Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn/ui, Postgres via `pg`).

Requisitos:

1. Remover a necessidade de editar HTML cru.
2. Permitir editar textos diretamente na landing page (modo edição inline).
3. Permitir substituir imagens diretamente na landing page.
4. Manter o `/areareservada` como backoffice agrupado por secção.
5. Formatação limitada a texto plano + quebras de linha.

## Modelo de dados

### Nova tabela `site_content`

```sql
CREATE TABLE site_content (
  key     TEXT PRIMARY KEY,
  value   TEXT NOT NULL,
  label   TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'geral'
);
```

> A coluna `section` corresponde ao `section` do Quirqui. Usamos `section` porque `section` é palavra reservada em SQL.

Exemplos de chaves:

- `home.hero.title`
- `home.hero.description`
- `home.services.0.title`
- `home.services.0.description`
- `home.services.0.image`
- `header.logoImage`
- `footer.copyright`

### Geração automática de chaves

Um utilitário `flattenContent(content)` transforma o objeto `DEFAULT_CONTENT` atual em lista de `{ key, value, label, section }`.

- Objetos aninhados usam notação de ponto.
- Arrays usam índice numérico (`0`, `1`, ...).
- Valores não-string (números, booleanos) são convertidos para string no `value`.
- O `section` é o primeiro segmento da chave (`home`, `servicos`, `sobre`, `contactos`, `header`, `footer`, `imagens`).
- O `label` é gerado por `humanize(key)` com possibilidade de overrides para maior clareza.

### Migração

No arranque da aplicação (`src/lib/db-server.ts`):

1. Verificar se `site_content` existe e tem a coluna `data` (schema antigo).
2. Se for o schema antigo:
   a. Renomear a tabela para `site_content_legacy`.
   b. Criar a nova tabela `site_content`.
   c. Ler a linha `id = 1` da tabela legada.
   d. Fazer `flattenContent` dos dados existentes.
   e. Inserir na nova tabela (ignorar conflitos de `key`).
   f. Remover a tabela legada.
3. Se `site_content` não existir, criar a nova tabela.
4. Se a tabela estiver vazia, fazer seed a partir do `DEFAULT_CONTENT` atual convertido para key-value.

## API

Todas as rotas de escrita reutilizam a autenticação existente: cookie `hup_session` + `verifySession` em `src/lib/jwt.ts`. Apenas role `admin` pode escrever.

### `GET /api/content`

Pública. Devolve:

```json
{
  "home.hero.title": "Felicidade que gera resultados",
  "home.hero.description": "...",
  "home.services.0.title": "..."
}
```

Implementação: `src/app/api/content/route.ts`.

### `GET /api/content/admin`

Só admin. Devolve array de rows:

```json
[
  { "key": "home.hero.title", "value": "...", "label": "Home — Título hero", "section": "home" }
]
```

Implementação: `src/app/api/content/admin/route.ts`.

### `PUT /api/content/[key]`

Só admin. Body: `{ value: string }`.

Faz `INSERT ... ON CONFLICT (key) DO UPDATE`.

Validações:

- `key` só pode conter `a-z`, `0-9`, `.`, `_`, `-`.
- `value` é string (texto livre).

### `POST /api/content/upload`

Só admin. Recebe `multipart/form-data` com:

- `image`: ficheiro de imagem.
- `key`: chave do conteúdo a atualizar (ex: `home.hero.backgroundImage`).

Comportamento:

- Guarda o ficheiro em `public/images/content/<timestamp>-<hash>.<ext>`.
- Limites: `image/*`, máximo 8 MB.
- Atualiza a chave correspondente com a URL relativa `/images/content/<filename>`.
- Devolve `{ key, url }`.

> Nota: o armazenamento local em disco é adequado para desenvolvimento e servidores persistentes. Em deploys serverless (ex: Vercel), o filesystem é efémero e será necessário substituir por Vercel Blob / Supabase Storage numa fase posterior.

## Componentes de edição inline

Localização: `src/components/cms/`.

### `SiteContentProvider`

Substitui o `ContentProvider` atual (`src/lib/content-store.tsx`).

Responsabilidades:

- Carregar `/api/content` no cliente.
- Expor `content: Record<string, string>`.
- Expor `editMode: boolean` e `setEditMode`.
- Expor `saveContent(key, value)` que faz `PUT /api/content/[key]` e atualiza o estado local.

O `editMode` é inicializado a `false`. A barra de admin é quem o controla.

### `useSiteContent(key, fallback)`

Hook de leitura:

```ts
const title = useSiteContent("home.hero.title", "Felicidade que gera resultados");
```

### `EditableText`

Props:

```ts
interface EditableTextProps {
  contentKey: string;
  fallback?: string;
  tag?: keyof JSX.IntrinsicElements; // h1, p, span, etc.
  className?: string;
  multiline?: boolean; // se true, aceita Shift+Enter para nova linha
}
```

Comportamento:

- Fora do modo edição: renderiza `<Tag>{value}</Tag>`.
- Em modo edição: `contentEditable` com outline amarelo e botão flutuante "Guardar".
- `Enter` guarda.
- `Shift+Enter` insere nova linha (se `multiline`).
- Guarda via `saveContent(key, innerText.trim())`.
- Preserva classes Tailwind e estilos do componente pai.

### `EditableImage`

Props:

```ts
interface EditableImageProps {
  contentKey: string;
  fallback: string;
  alt?: string;
  className?: string;
  fill?: boolean; // para Next.js Image fill
}
```

Comportamento:

- Fora do modo edição: renderiza `Image` do Next.js.
- Em modo edição: overlay "Trocar imagem" com input file escondido.
- Upload via `POST /api/content/upload`.
- Substitui a chave com a nova URL.

### `EditableBackground`

Para imagens de fundo aplicadas via CSS (`backgroundImage`).

Props:

```ts
interface EditableBackgroundProps {
  contentKey: string;
  fallback: string;
  overlay?: string; // ex: "rgba(20,20,20,0.55)"
  className?: string;
  children: React.ReactNode;
}
```

Comportamento:

- Renderiza um wrapper `div` com `style={{ backgroundImage: ... }}`.
- Em modo edição, mostra overlay de upload semelhante ao `EditableImage`.

## Admin bar

Novo componente `AdminBar` em `src/components/cms/AdminBar.tsx`.

- Aparece apenas quando `useAuth()` devolve `role === "admin"`.
- Posição fixa na parte inferior (`fixed bottom-0`).
- Contém:
  - Indicador "HumanUp Admin".
  - Botão toggle "Ativar Edição" / "Modo Edição ON".
  - Instrução curta quando ativo.
  - Link para `/areareservada`.
  - Botão "Sair".

É inserido no layout raiz (`src/app/layout.tsx`), dentro dos providers, para estar disponível em todas as páginas.

## Backoffice `/areareservada`

Reescrever `src/app/areareservada/page.tsx` para usar o novo modelo key-value.

Layout:

- Header fixo com título "Área Reservada" e botão "Repor predefinições".
- Lista de secções agrupadas por `section`.
- Cada secção é um acordeão (`shadcn/ui Collapsible` ou semelhante).
- Dentro de cada secção, cada campo mostra:
  - `label`.
  - `input` para textos curtos (`<= 80` caracteres).
  - `textarea` para textos longos.
  - botão "Guardar" por campo.

Funcionalidades:

- Carrega `/api/content/admin`.
- Guarda individualmente com `PUT /api/content/[key]`.
- "Repor predefinições" limpa a tabela `site_content` e re-insere o seed.

## Adaptação dos componentes da landing page

Os componentes deixam de consumir o objeto `SiteContent` e passam a usar keys:

- `src/components/SiteHeader.tsx`: `header.logoText`, `header.logoImage`, `header.ctaLabel`.
- `src/components/SiteFooter.tsx`: `footer.copyright`, `footer.nav.*.label`.
- `src/components/HeroFlowCards.tsx`: `home.hero.title`, `home.hero.description`, `home.hero.ctaLabel`, `home.hero.backgroundImage`.
- `src/components/ServicesFlow.tsx` / `ServicesSwiper.tsx`: `home.services.*.title`, `home.services.*.description`, `home.services.*.buttonText`, `home.services.*.image`.
- `src/components/WhyInvestSection.tsx`: `home.whyInvest.title`, `home.whyInvest.body`, `home.whyInvest.image`.
- `src/components/StatsCounter.tsx`: `home.stats.*.value`, `home.stats.*.suffix`, `home.stats.*.label`, `home.statsSource`, `home.stats.backgroundImage`.
- `src/components/CTASection.tsx`: `home.cta.title`, `home.cta.buttonLabel`.
- `src/app/sobre/page.tsx` e componentes relacionados: `sobre.hero.*`, `sobre.quemSomos.*`, `sobre.proposito.*`, etc.
- `src/app/servicos/page.tsx`: `servicos.hero.*`, `servicos.packages.*`, `servicos.methodSteps.*`, `servicos.cta.*`.
- `src/app/contactos/page.tsx`: `contactos.hero.title`, `contactos.title`, `contactos.emailLines.*`, `contactos.endereco`, `contactos.formTitle`.

Imagens de fundo passam a `EditableBackground`. Imagens `<Image>` passam a `EditableImage`. O fallback de cada uma é o path atual, garantindo que o site continua a funcionar mesmo sem conteúdo editado.

## Formatação de texto

- Texto guardado como string plana.
- Quebras de linha representadas pelo caractere `\n`.
- Campos multilinha renderizam com `white-space: pre-line` ou equivalente para respeitar as quebras.
- Tags HTML (`<br>`, `<strong>`) são removidas do conteúdo por defeito.
- `<br>` e `<br />` são convertidos para `\n` durante o seed/migração.
- Tags de estilo (`<strong>`, `</strong>`) são removidos sem substituição.

> Consequência: os destaques em negrito nas estatísticas (ex: `<strong>burnout</strong>`) passam a texto corrido. Se for necessário suportar negrito no futuro, a alteração para uma convenção leve (ex: Markdown `**texto**`) é localizada no componente de renderização.

## Segurança

- Todas as rotas de escrita (`/api/content/admin`, `/api/content/[key]`, `/api/content/upload`) verificam sessão via cookie `hup_session` e exigem `role === "admin"`.
- Upload valida mimetype e tamanho.
- Nomes de ficheiro gerados com timestamp + hash para evitar colisões e path traversal.
- Validação de `key` restringe caracteres permitidos.

## Erros e feedback

- Inline: mostra indicador visual ao guardar ("...", "✓ Guardado", "Erro").
- Backoffice: toast/snackbar para sucesso/erro.
- Se `GET /api/content` falhar, os componentes usam o `fallback` hardcoded.

## Testes / validação

- `npm run typecheck` passa sem erros.
- `npm run build` passa.
- Login como admin → `AdminBar` visível.
- Ativar modo edição → textos passíveis de edição com contorno amarelo.
- Editar texto inline → refresh mostra alteração persistida.
- Editar campo no `/areareservada` → alteração reflete-se no site.
- Upload de imagem → imagem nova visível após refresh.
- "Repor predefinições" restaura o conteúdo original.

## Riscos e limitações

1. **Upload local:** funciona em dev e servidores persistentes. Deploy serverless requer adaptação para armazenamento remoto.
2. **Arrays dinâmicos:** adicionar/remover itens de listas (serviços, estatísticas, etc.) é feito no backoffice, não inline.
3. **Perda de negrito:** remoção de HTML implica perda dos destaques visuais nas estatísticas. Aceitável no scope atual, mas reversível futuramente.
4. **Refactor de componentes:** todos os componentes que consomem conteúdo precisam de ser atualizados. O risco é mitigado mantendo fallbacks.

## Próximos passos

Após aprovação deste spec, invocar a skill `writing-plans` para produzir o plano de implementação detalhado.
