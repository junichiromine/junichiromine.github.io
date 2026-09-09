# junichiromine.github.io

Website of ISGRAPH.JP

## Development

```bash
npm install
npm run dev      # start local dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
```

Built with React and [Base UI](https://base-ui.com/) (`@base-ui/react`).

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes `dist/` via GitHub Pages. In the repository's Settings →
Pages, set the source to "GitHub Actions" (one-time setup).
