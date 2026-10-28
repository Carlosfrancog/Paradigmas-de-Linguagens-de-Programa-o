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
