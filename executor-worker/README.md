# Executor opcional da Oficina

O GitHub Pages **não executa C**. Este Worker recebe o código do editor e encaminha a um serviço Piston **autogerenciado e isolado**. A API Piston externa não é presumida como gratuita ou disponível. É necessário contratar/hospedar um executor com limites de CPU, memória, rede e tempo; nunca execute programas enviados por visitantes diretamente no Worker ou no host sem isolamento.

1. Crie um runner Piston em infraestrutura própria com isolamento por container, limites de recursos e sem acesso a serviços internos. Configure autenticação para a API do runner.
2. No Cloudflare, implante `worker.js` com nome `plp-code-runner` (exemplo de configuração em `wrangler.toml.example`). Defina `PISTON_URL` como a URL do servidor Piston, `ALLOWED_ORIGINS` como a URL exata do GitHub Pages (por exemplo `https://carlosfrancog.github.io`) e `PISTON_TOKEN` como secret quando o runner exigir autorização.
3. No site, configure apenas a URL **pública** do Worker em `executor-config.json`: `{"baseUrl":"https://seu-worker.seu-subdominio.workers.dev"}`.
4. Publique via PR, valide a origem CORS e teste um programa `printf` após responder a uma questão.

Para proteger cotas: crie regras de rate limiting/bot protection na Cloudflare para `/execute`, limite requisições por IP e imponha quotas no runner. **CORS não é autenticação e não impede abuso fora do navegador.** Nunca faça proxy genérico de URLs externas. A compilação é independente da correção: editar código não muda a resposta já registrada nem libera moedas.

Apenas trechos C podem rodar. Questões de Java, OO e pseudocódigo seguem como exemplos conceituais. A execução depende do Worker publicado e do runner configurado.
