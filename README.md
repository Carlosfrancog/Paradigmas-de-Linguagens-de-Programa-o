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

## Proteger a branch `main` (configuração manual do proprietário)

No GitHub, acesse **Settings → Rules → Rulesets → New branch ruleset** (ou **Branches → Add branch protection rule**, se disponível). Alvo: `main`. Exija Pull Request, pelo menos 1 aprovação de mantenedor, aprovação do CODEOWNERS quando disponível, resolução de conversas e bloqueio de force push/deleção. Restrinja bypasses e deixe GitHub Actions com permissões padrão de leitura. Antes de exigir checks, crie e valide um check de PR; o workflow de publicação roda somente após merge em `main`.

Em repositórios públicos pessoais, algumas restrições podem depender das funcionalidades disponíveis no plano GitHub. Confirme o que sua conta permite antes de marcar opções.
