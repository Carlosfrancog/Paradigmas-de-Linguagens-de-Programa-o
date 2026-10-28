# PLP Estudos — V3

Portal estático de revisão de Paradigmas de Linguagens de Programação, construído a partir dos PDFs da disciplina.

## Funcionalidades

- 14 PDFs originais incluídos na pasta `material/`;
- cards de revisão com navegação, 9 resumos e leitor PDF;
- leitura guiada com explicações próprias das páginas-chave de cada documento, referências de página e consulta ao PDF original;
- simulado de 10 questões sorteadas em 15 minutos, com correção comentada;
- histórico local detalhado, estatísticas de notas e evolução por assunto;
- revisão inteligente, priorizando questões erradas no histórico;
- laboratório interativo de código (escopo, ponteiros, passagem por valor, laços, OO, enums e tokens).

## Como testar

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`. Não use `file://`, pois os guias JSON são carregados via `fetch`.

## GitHub Pages

O workflow `.github/workflows/pages.yml` publica automaticamente o diretório raiz ao enviar commits para `main`. Em Settings → Pages, defina Source = GitHub Actions.

## Privacidade e limites

As notas e tentativas ficam **somente no localStorage deste navegador**. Não há sincronização entre dispositivos, autenticação, classificação pública ou backend. Apagar dados do navegador pode apagar o histórico. O temporizador utiliza o relógio do dispositivo, logo não é um sistema de fiscalização ou prova oficial. O banco de questões fica disponível no JavaScript público e não é mantido em segredo. Bloqueio de F12 não fornece proteção real e não é utilizado.

Leitura guiada: interpreta e explica os pontos relevantes das aulas; **não substitui uma explicação exaustiva de todos os slides**. Alguns PDFs têm imagens e códigos; consulte o original para esses elementos. Conteúdos de paradigmas funcional e lógico têm cobertura introdutória no acervo anexado.
