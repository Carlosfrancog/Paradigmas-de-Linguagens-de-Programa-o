# Paradigmas de Linguagens de Programação — Estudos rápidos

Site estático de apoio à disciplina, preparado para GitHub Pages.

## Recursos
- estudos rápidos por tema;
- resumos em blocos;
- simulados aleatórios com 10 questões;
- histórico local por nome usando `localStorage`;
- PDFs originais anexados em `material/`;
- deploy automático via GitHub Actions.

## Rodar localmente
Como o projeto é HTML/CSS/JS puro, você pode abrir `index.html` diretamente ou usar um servidor local:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## GitHub Pages
O workflow `.github/workflows/pages.yml` publica o conteúdo da raiz do repositório. Em **Settings → Pages**, use **Source: GitHub Actions**.
