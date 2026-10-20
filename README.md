# Node.js — The Complete Guide (Course Source Code)

Companion source code for the Udemy course [Node.js: The Complete Guide](https://www.udemy.com/course/nodejs-the-complete-guide/) (Academind / Maximilian Schwarzmüller). This repository mirrors the study notes and projects tracked in the author's [Notion database](https://app.notion.com/p/79f56ea01d2c4705937d44be575e3dc5?v=3f6e97a262dc819d9028000cad976cc1&source=copy_link).

> Status: early modules. More sections (Express, MVC, REST APIs, databases, auth, testing, TypeScript, Deno, …) will be added as the course progresses.

## Prerequisites

- Node.js (LTS) and npm
- A code editor (VS Code recommended)

## Repository structure

```text
.
├── Node.js Basics — Core/
│   ├── 01 — Event-Driven Task Simulator/   (placeholder)
│   ├── file-processing-server/             HTTP server + sync/async fs demo
│   └── Project 02 — Async Execution Lab/   Event loop demo
└── workWithExpress/
    └── express-shop/                       Express multi-page shop
```

## Projects

### 1. `Node.js Basics — Core/file-processing-server`

A plain Node.js `http` server demonstrating blocking vs non-blocking file reads.

- Routes: `/`, `/file` (async `fs.readFile`), `/file-blocking` (`fs.readFileSync`), 404 fallback
- Run:

```powershell
cd "Node.js Basics — Core\file-processing-server"
npm install
npm start        # node app.js
npm run dev      # node --watch app.js
```

### 2. `Node.js Basics — Core/Project 02 — Async Execution Lab`

Demonstrates the Node.js event loop: synchronous code, `setTimeout(0)`, and timers.

```powershell
cd "Node.js Basics — Core\Project 02 — Async Execution Lab"
npm start        # node app.js
```

### 3. `workWithExpress/express-shop`

Express 5 shop with routers, middleware, static files, form handling, and a custom 404 page. See its own [README](workWithExpress/express-shop/README.md).

- Routes: `GET /`, `GET /products`, `GET /admin/add-product`, `POST /admin/add-product`
- Run:

```powershell
cd workWithExpress\express-shop
npm install
npm start        # node app.js  -> http://localhost:3000
```

## Course coverage (so far)

| Module | Folder |
|---|---|
| Understanding the Basics (HTTP server, event loop, modules, fs) | `Node.js Basics — Core/` |
| Working with Express.js | `workWithExpress/` |

## Notes

- `node_modules/` is committed for the `express-shop` project; run `npm install` if missing.
- In-memory data (e.g. the product list) resets on server restart.
- Empty placeholder folders are reserved for upcoming modules.
