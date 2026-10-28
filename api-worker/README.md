# API comunitária da V4 — Cloudflare Worker + D1

O GitHub Pages **não consegue receber POST nem gravar um JSON de forma global**. Esta API oferece um JSON público em `GET /api/data`, composto a partir de duas tabelas no D1. O repositório e a interface continuam estáticos no GitHub Pages.

## Como ativar

1. Crie uma conta Cloudflare e instale `wrangler` usando `npm install -g wrangler`, ou execute `npx wrangler` sem instalação global.
2. Autentique-se: `npx wrangler login`.
3. Dentro de `api-worker/`, execute `npx wrangler d1 create plp-estudos`. Copie o `database_id` retornado para `wrangler.toml`.
4. Execute `npx wrangler d1 execute plp-estudos --remote --file=schema.sql`.
5. Execute `npx wrangler deploy`. Copie a URL `https://...workers.dev` retornada.
6. No `config.json` da **raiz do site**, configure `{ "apiBase": "https://SEU-WORKER.workers.dev" }` e faça push. O GitHub Pages vai publicar a nova configuração.
7. Abra `https://SEU-WORKER.workers.dev/api/data` e confira a saída JSON.

O Worker publica **somente** nome, nota (0–10), data, estrelas e comentários previamente aprovados. Gabaritos e respostas detalhadas nunca são enviados para essa API.

### Moderação de comentários

Por segurança, feedback novo entra com `visible=0`. Para publicar um comentário aprovado, use o console D1 da Cloudflare ou:

```bash
npx wrangler d1 execute plp-estudos --remote --command "SELECT id,name,rating,comment,visible FROM feedback ORDER BY id DESC LIMIT 20"
npx wrangler d1 execute plp-estudos --remote --command "UPDATE feedback SET visible=1 WHERE id=1"
```

Para ocultar: `UPDATE feedback SET visible=0 WHERE id=1`. Para excluir: `DELETE FROM feedback WHERE id=1`.

### Observações importantes

- **Sem autenticação**, qualquer pessoa pode enviar notas fictícias. Não use isso como ranking certificado. Para proteger placares contra fraude, você precisaria de login/validação de sessão e provas fiscalizadas por servidor.
- A validação de origem CORS **não é autenticação**. Um script ou HTTP client pode enviar requisições sem cabeçalho `Origin`. Configure limite de requisições no painel Cloudflare (WAF/rate limiting) e proteção anti-bot/Turnstile se o site ganhar tráfego público.
- O `GET /api/data` retorna um JSON global agregado. Ele **não é um arquivo físico `data.json` atualizado no repo**. O D1 é o armazenamento persistente, e a API é a camada JSON.
- Os nomes e comentários publicados ficam visíveis a visitantes. Informe aos estudantes antes de coletá-los e ofereça solicitação de remoção dos dados.
