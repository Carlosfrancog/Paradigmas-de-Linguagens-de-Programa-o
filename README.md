# PLP Estudos — V4 (cyber study)

Portal estático de apoio à disciplina de Paradigmas de Linguagens de Programação, com 14 PDFs originais, explicações guiadas, resumos, banco de simulados, timer de 15 min, histórico detalhado por navegador, revisões por erro, oficina, skins desbloqueáveis, flashcards e comunidade.

## Para colaboradores

Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de propor mudanças. Trabalhe em branches `feat/*`, `fix/*`, `docs/*`, `style/*`, `test/*` ou `chore/*` e abra **PR para `main`**; não envie commits diretos para `main`. As alterações em CI, API e permissões precisam de revisão explícita do mantenedor. Veja também [SECURITY.md](SECURITY.md).

O workflow de publicação é visível por ser um repositório público; isso **não** permite esconder sua implementação. As medidas corretas são não divulgar secrets, usar permissões mínimas, revisão de PR e publicar apenas o conteúdo de `dist/`.

## Executar localmente

```powershell
python -m http.server 8000
```

Abra http://localhost:8000. Não use `file://`, porque os guias e a configuração são carregados por `fetch`.

## Deploy GitHub Pages

Acesse seu repo local, substitua os arquivos do ZIP sem apagar `.git`, e execute:

```powershell
git switch -c feat/plp-v4
git add .
git commit -m "feat: PLP v4 cyber study, mobile, flashcards e API global"
git push -u origin feat/plp-v4
# Abra um PR de feat/plp-v4 para main no GitHub
```

O workflow existente publica o site. **A API não é implantada pelo workflow do GitHub Pages**, pois Cloudflare D1 requer a configuração da sua conta. Veja [api-worker/README.md](api-worker/README.md).

## Pontuações e feedback globais

O site funciona em **modo local** sem API. Para compartilhar notas e avaliações entre celulares e computadores, configure a API Cloudflare Worker/D1 e preencha `config.json`. O endpoint `GET /api/data` retorna JSON com duas coleções: `attempts` (notas) e `feedback` (avaliações aprovadas).

O navegador guarda as respostas detalhadas apenas em `localStorage`. A API recebe somente `id`, `name`, `score` e `date` por tentativa. Publicações por nome são públicas; convém usar apelidos. Feedback é enviado para moderação antes de ficar público.

## V4

- Visual cyberpunk neon e 4 temas: uma skin padrão e 3 desbloqueáveis ao acertar 2, 4 e 7 exercícios da oficina.
- Layout mobile-first nos componentes críticos, menu rolável, cartões e alternativas com áreas maiores de toque, leitor PDF empilhado no celular.
- Flashcards com revisão espaçada usando intervalos progressivos por acerto; agenda local.
- Simulado de 10 questões, 15 minutos, seleção mista / fundamentos / aplicação / desafio, revisão inteligente por erros.
- Feedback com modal e toast diagonal no canto superior direito após 45s, reaparecendo após 72h. Fechamento manual respeitado.
- Mural com placares e comentários globais somente quando a API está configurada.
- Favicon SVG + manifest para instalação em dispositivo compatível (não é um PWA offline completo).

## Limitações

A classificação de dificuldade é heurística e editorial. Os PDFs permanecem a fonte da disciplina; o guia interpretativo não substitui o material original. A API não comprova que as notas foram obtidas por alunos reais. Ainda não há conta, sincronização de progresso individual ou execução remota de código.

## V5 — Rotas, oficina e wallet

O projeto mantém o histórico da V4. A navegação agora usa rotas estáticas via *hash* (`#inicio`, `#estudo`, `#resumos`, `#materiais`, `#simulado`, `#progresso`, `#laboratorio`, `#wallet`, `#flashcards`, `#comunidade`). São rotas client-side compatíveis com Pages e recarregamento direto, sem arquivos HTML duplicados.

A oficina possui **8 módulos, 112 variações parametrizadas por módulo, 896 variações no total**. Cada módulo usa 8 famílias de exercícios e 14 variações numéricas (não são 896 questões manuscritas e independentes). Respostas locais são registradas em `localStorage`, não repetem no mesmo navegador e não rendem moedas. As **questões com coins** são emitidas pelo Worker e corrigidas no backend. A API oferece 110 variantes por módulo, geradas de 1 família por módulo: não confunda as quantidades do modo local com as do modo remunerado. Uma questão respondida não pode ser pontuada novamente, mesmo se tiver sido errada. Recompensa: 5 coins por acerto.

A wallet NÃO usa um JSON editável para armazenar senhas e coins. Isso seria inseguro. O D1 guarda PBKDF2-SHA256 + salt para senhas, sessões representadas por hash do token e saldo atualizado exclusivamente após validação da resposta no servidor. O JSON público em `GET /api/wallet/ranking` mostra somente nome e coins. O token temporário fica em `sessionStorage`; não faça commit de tokens ou dados de produção. A arquitetura não usa JWE: ele não substitui hash de senha, e não é necessário para proteger senhas em D1.

### Configurar carteira e placar global

Use as instruções de [`api-worker/README.md`](api-worker/README.md). Quando já tiver implantado a API da V4, execute a migração das **novas tabelas** de wallet, sem apagar as anteriores. Faça backup do D1 antes de aplicar mudanças. No diretório `api-worker`:

```bash
npx wrangler d1 execute plp-estudos --remote --file=wallet-migration.sql
npx wrangler deploy
```

O `schema.sql` completo é destinado a novas instalações. O arquivo `wallet-migration.sql` contém apenas tabelas da V5. Atualize `config.json` com a URL HTTPS do Worker. Sem API o modo local e os simulados continuam disponíveis; login, coins e ranking global não funcionam.

### Segurança e revisão de PR

- A base de questões da oficina no navegador é conteúdo educacional público; não coloque credenciais ou segredos nela.
- O Worker nunca aceita saldo ou quantidade de moedas enviados pelo cliente.
- Dados da carteira são pessoais: não exponha hashes, sessões nem listas de contas via endpoint público.
- O endpoint de login implementa limite simples por IP, **mas é recomendável adicionar Cloudflare Turnstile e rate limiting na borda antes de crescer**.
- Para uma competição com dinheiro ou prêmios, inclua auditoria transacional, autenticação mais robusta, remoção de contas e proteção contra múltiplas contas. O sistema atual é recreativo.
- PRs que mudem regras de coins, autenticação, migrações D1 ou CI devem ter revisão humana e teste em ambiente de homologação.

### Publicar a V5 por PR

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/wallet-oficina-v5
# copie os arquivos V5 para o repositório preservando .git
git add .
git commit -m "feat: rotas, oficina ampliada, wallet e ajustes mobile"
git push -u origin feat/wallet-oficina-v5
```

Abra um Pull Request de `feat/wallet-oficina-v5` para `main`. Só faça merge após conferir a responsividade e o Worker; o GitHub Actions deve publicar apenas os ativos especificados em `dist`.
