# Colaborando com PLP Estudos

Obrigado por ajudar no portal! Todo código novo deve entrar por **Pull Request (PR)**; não envie commits diretamente à `main`.

## Fluxo de trabalho

1. Abra uma issue descrevendo o problema/melhoria (para ajustes pequenos, pode abrir diretamente um PR explicando a mudança).
2. Atualize a sua cópia: `git checkout main; git pull --ff-only origin main`.
3. Crie uma branch a partir da `main`: `git switch -c feat/navegacao-mobile`.
4. Faça modificações pequenas e focadas; verifique o site no navegador e no celular.
5. Confirme que não há credenciais no diff: `git diff --cached --check` e `git diff --cached`.
6. Envie **a sua branch**, não `main`: `git push -u origin feat/navegacao-mobile`.
7. No GitHub, escolha **Compare & pull request**, com **base: `main`** e **compare: sua branch**. Preencha o template, mencione a issue e peça revisão.
8. Aguarde o feedback, os checks automáticos e a aprovação de um mantenedor. Somente mantenedores devem fazer o merge.

### Convenção de branches

| Prefixo | Uso | Exemplo |
| --- | --- | --- |
| `feat/` | funcionalidade nova | `feat/flashcards-acessiveis` |
| `fix/` | correção de bug | `fix/timer-mobile` |
| `docs/` | documentação e texto | `docs/revisao-oo` |
| `style/` | estilo e layout sem mudança de lógica | `style/cards-neon` |
| `test/` | testes | `test/simulado-tempo` |
| `chore/` | manutenção não funcional | `chore/limpeza-assets` |

Use mensagens de commit como `feat: adiciona modo revisão` ou `fix: corrige timer ao reabrir`.

## Rodar e validar

Instale apenas Python 3 ou equivalente. Dentro da raiz do projeto:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`. Faça um simulado, corrija respostas, teste o popup, altere uma skin e revise a visualização no DevTools em 360px e 768px. Um PR que altera layout deve incluir captura de tela desktop + celular. Para mudanças em JS, rode `node --check app.js`, `node --check v3.js` e `node --check v4.js` se Node estiver disponível.

## Materiais e questões

- Mantenha os PDFs originais na pasta `material/` e não modifique seu conteúdo silenciosamente.
- Explique em português simples, mas preserve fidelidade aos documentos. Associe perguntas e guias à aula/assunto.
- Novas questões exigem alternativa correta, justificativa e revisão de ambiguidade. Não copie prova externa integralmente.
- Evite adicionar bibliotecas grandes para recursos que possam ser feitos com JavaScript nativo.

## Segurança, privacidade e automações

O repositório é **público**: código, workflows YAML, PRs, diffs e histórico de commits são visíveis. **Não existe forma confiável de esconder do público como o CI público está escrito.** Não publique credenciais, IDs de sessão, tokens, `.env`, chaves privadas, dados pessoais, prints de painéis com informações sigilosas ou detalhes de infraestrutura privada. Não adicione logs de autenticação nem copie valores de secrets para comentários, issues ou PRs.

- **Nunca altere** `.github/workflows/`, `api-worker/`, configurações de autorização ou política de publicação sem issue e aprovação explícita do mantenedor. Não é um convite para explorar ou divulgar detalhes internos.
- O pipeline de Pages publica **somente** arquivos estáticos explicitamente listados em `dist/`, não os scripts do servidor nem ferramentas de manutenção.
- O arquivo `config.json` no site é público: deve conter apenas a URL pública do Worker, nunca segredo.
- **Pull requests de forks não devem receber secrets**. Mantenedores devem revisar alterações de workflows antes do merge. Evite `pull_request_target` e execução de código externo com privilégios.
- Não tente registrar avaliações ou notas reais em dados de produção para testar; use ambiente local ou de homologação.
- Se encontrar vulnerabilidade, **não publique PoC, tokens ou detalhes de exploração em issues/PRs públicos**. Siga [SECURITY.md](SECURITY.md).

## Checklist antes do PR

- [ ] Testei a navegação no desktop e no celular.
- [ ] Não incluí segredos, dados privados ou artefatos de build.
- [ ] A mudança preserva histórico local e funcionamento sem API.
- [ ] Expliquei o que foi modificado e como reproduzir/verificar.
- [ ] Não alterei pipeline, Worker ou permissões sem revisão do responsável.
