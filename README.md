# PLP Estudos — edição Study

Portal estático de revisão para a disciplina **Paradigmas de Linguagens de Programação**.

## Funcionalidades

- Resumos e cartões de estudo navegáveis.
- Leitura original dos 14 PDFs e material guiado.
- Simulados de dez questões, cronômetro de quinze minutos e correção comentada.
- Histórico de simulados e painel de evolução **salvos no próprio navegador**.
- Oficina de exercícios de código organizados em oito módulos. Após responder, exemplos C permitem editar e executar código através de um Worker opcional.
- Flashcards com revisão espaçada e skins liberadas durante o estudo.

Não é necessário criar conta. Sem um Worker configurado, a correção da oficina continua local e o editor não executa código. Esta edição não publica notas, comentários nem dados de usuários em serviços externos.

## Execução local

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`.

## Contribuições

Consulte [CONTRIBUTING.md](CONTRIBUTING.md). Envie alterações em uma branch própria e abra um Pull Request para `main`. Não envie dados pessoais ou credenciais.

## Publicação

A versão pública é composta exclusivamente pelos arquivos estáticos listados em `.github/workflows/pages.yml` e os PDFs em `material/`. O merge em `main` dispara o GitHub Pages.

## Privacidade

Históricos, respostas da oficina, flashcards e preferências visuais são salvos em `localStorage` no navegador. Eles não são sincronizados entre dispositivos. Limpar os dados do navegador pode apagá-los.


### Correções de estabilidade
O script `workshop.js` é o único responsável pelo estado da Oficina. O arquivo `hotfix-contrast.css` padroniza o contraste dos cards e exercícios. O workflow inclui explicitamente os assets da correção mobile de PDF.

### Oficina: perguntas vistas

A Oficina registra localmente a data de cada questão respondida. Uma pergunta não volta a ser exibida durante **1 hora**; se todas as perguntas de um módulo estiverem indisponíveis, um cronômetro mostra quando a próxima será liberada. Cada módulo tem seu próprio conjunto de perguntas e datas de liberação. A liberação ocorre automaticamente e não apaga o histórico dos simulados. O controle é local ao navegador/dispositivo e não é uma proteção contra manipulação de armazenamento pelo usuário.

### Relógio da prova

O botão flutuante de relógio permite informar data e horário da prova, acompanhar a contagem regressiva e acessar instruções para adicionar o site à tela inicial do celular. A data fica salva apenas no navegador do estudante.

### Contagem regressiva da prova

O relógio flutuante mostra a contagem regressiva até **29/10/2026, 19h10 (horário de São Paulo, UTC−03:00)**. Ao tocar no botão, também são exibidas orientações para adicionar o site à tela inicial do celular. A função não requer cadastro.

### PWA e skins
O portal oferece instalação quando o navegador suportar o prompt nativo. Em outros casos, o painel do relógio explica como adicionar o atalho à tela inicial. Nenhum serviço pode instalar um PWA sem consentimento do usuário. Os temas visuais são liberados por questões concluídas na Oficina.

## Oficina e instalação

O editor remoto de código foi removido da edição Study. A Oficina corrige exercícios e mostra explicações antes da próxima questão. Os exercícios ficam em pausa por uma hora por navegador depois de respondidos.

Para instalar no celular, use o botão do relógio. Navegadores compatíveis podem oferecer a instalação nativa; em outros casos, o painel mostra o caminho para adicionar o site à tela inicial. A instalação depende da confirmação do visitante.


### Progressão da Oficina
As questões acertadas deixam o sorteio. As erradas retornam após três outras respostas em qualquer módulo; o progresso é local ao navegador. Em **Zerar progresso da Oficina**, todas as questões, skins e conquistas são reiniciadas após confirmação.
