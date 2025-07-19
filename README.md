# Clippr

Clippr is a web scraping platform combining no-code wizards and pro-code tools. The project is organized as a monorepo with three workspaces:

- **web** – SvelteKit frontend with Tailwind CSS and the Clippy assistant.
- **api** – Node.js/Express backend providing REST and gRPC APIs.
- **cli** – TypeScript CLI distributed via npm and Homebrew.

## Tech Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind, ClippyJS.
- **Backend**: Node.js, Express, BullMQ, PostgreSQL via Prisma, Redis, S3.
- **CLI**: Node.js with Commander.

## Phased Implementation Plan

1. **Scaffolding** – Create monorepo structure and initial packages. Implement Clippy assistant and minimal wizard UI. Provide basic Express server and CLI commands.
2. **Scraping Engine** – Build HTTP workers and optional Puppeteer renderer. Add proxy and authentication modules. Integrate BullMQ for scheduling.
3. **Templates & AI Assist** – Template library, live selector previews, and AI based auto-detection.
4. **Data Delivery** – Support multiple export formats and destinations. Implement data viewer and dedupe tools.
5. **Dashboard & Analytics** – 3D globe dashboard, charts, logs, and heatmaps.

Each phase expands both no-code and pro-code capabilities while maintaining full test coverage and CI/CD pipelines.

