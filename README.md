# PLP · portal de estudos (v2)

Estudos rápidos da disciplina Paradigmas de Linguagens de Programação, com cards navegáveis, resumos, leitura original/guiada dos 14 PDFs e simulados de 10 questões em até 15 minutos.

## Como executar

Pode ser hospedado diretamente no GitHub Pages. Para executar localmente, abra um terminal na raiz e rode:

```bash
python -m http.server 8000
```

Visite http://localhost:8000. **Não abra o HTML via `file://`**, porque a leitura guiada busca `guided.json` via `fetch`.

## Arquitetura

- `index.html`, `styles.css`, `app.js`, `data.js`: frontend estático sem dependências.
- `guided.json`: guias editoriais dos 14 documentos, mais trechos de texto por página extraídos dos PDFs. Figuras e tabelas continuam nos PDFs originais; a interpretação guiada não equivale a uma explicação detalhada de cada figura de cada slide.
- `material/`: PDFs originais.
- `.github/workflows/pages.yml`: publicação pelo GitHub Actions.
- Banco de questões: 51 perguntas autorais baseadas no material (36 iniciais + 15 novas). Questões novas têm explicações específicas; as iniciais recebem contextualização por tema.

## Histórico e cronômetro

- Tentativas são registradas no `localStorage` **deste navegador e dispositivo**; não são compartilhadas entre computadores.
- Os históricos antigos do portal v1 podem aparecer sem revisão detalhada, pois a v1 salvava apenas nota/nome/data.
- O prazo de 15 minutos usa horário absoluto (`Date.now`) salvo localmente. A página recupera a prova em andamento após um reload e entrega automaticamente quando o prazo expirou. Isso não é um sistema antifraude com tempo de servidor.
- O site não precisa de login nem de servidor de dados.

## Segurança / obfuscação

No GitHub Pages, todos os arquivos entregues ao navegador são públicos. **Não é possível bloquear de verdade o F12, as Ferramentas de Desenvolvedor ou o acesso às respostas do banco de questões.** Bloquear teclado ou menu de contexto apenas atrapalharia acessibilidade e seria facilmente contornado. Para provas avaliativas com segredo real, use backend para armazenar gabaritos, tempo e pontuação.

## Deploy

Configure Pages → Source: GitHub Actions e faça push na branch `main`.
