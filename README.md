# MarketNode — Inventory & Order Management

MarketNode is a take-home app with two surfaces that share one product catalog and Postgres database:

- **IMS** — staff inventory management (products, pricing, stock)
- **OMS** — customer storefront (browse, place orders, order history)

Payment, authentication, and shipping are intentionally out of scope (`PRODUCT.md` / `TASKS.md`).

---

## Quick start (reviewers)

From the repository root:

```bash
docker-compose up --build
```

Then open:

**http://localhost:18081/**

That single URL serves both the React UI and the `/api` backend. No separate frontend command is required when using Docker.

Stop with `Ctrl+C`, or:

```bash
docker-compose down
```

To wipe the database volume as well (fresh demo seed next start):

```bash
docker-compose down -v
```

---

## Ports

| Service | Host port | Container / process | Why this port |
|---------|-----------|---------------------|---------------|
| Web UI + API | **18081** | Spring Boot (`server.port=18081`) | Avoids common clashes with `8080` / `8081` used by other local Spring, Tomcat, or compose stacks |
| PostgreSQL | **15434** → `5432` | `postgres:16` | Avoids clashes with default Postgres `5432` and other common remaps like `5433` / `5434` |

Inside the Docker network the database remains on container port `5432`; only the **published host ports** are non-default.

### Local development (optional)

If you run services outside Compose:

| Process | Port | Notes |
|---------|------|--------|
| Backend (`spring-boot:run` / jar) | `18081` | See `backend/src/main/resources/application.properties` |
| Postgres (compose or local) | `15434` | JDBC default URL uses `localhost:15434` |
| Vite (`npm run dev` in `frontend/`) | Vite default (usually `5173`) | Proxies `/api` → `http://localhost:18081` |

---

## Demo data

On first startup against an **empty** product table, the backend seeds:

- Products across all PRODUCT categories (`Electronics`, `Clothing`, `Home & Garden`, `Sports`, `Books`, `Other`)
- Mix of in-stock and out-of-stock items
- Orders for dummy users **Alice (1)**, **Bob (2)**, and **Carol (3)** in both `CREATED` and `CANCELLED` states

Seeding is skipped when products already exist. Toggle with:

```properties
app.demo-seed.enabled=true
```

Tests set `app.demo-seed.enabled=false`.

Switch users in the OMS/IMS header dropdown to see each person’s order history.

---

## Application map

| Path | System |
|------|--------|
| `/` | Choose IMS or OMS |
| `/ims/products` | Product list |
| `/ims/products/:id` | Detail, edit, stock adjust, delete |
| `/oms/catalog` | Storefront catalog (in/out stock only) |
| `/oms/catalog/:id` | Place order |
| `/oms/orders` | Order history |
| `/oms/orders/:id` | Order detail / cancel |

---

## Notable decisions

1. **SPA packaged in the API jar** — Docker multi-stage build compiles the Vite app into Spring `static/`, so `docker-compose up` alone meets the TASKS “no extra app commands” bar without adding a Node service to Compose (TASKS forbids extra third-party Compose images).
2. **Non-default ports** — Chosen so reviewers (and local machines already using `8081` / `5434`) are less likely to hit bind conflicts.
3. **Stateless list APIs** — Catalog and order lists take filter/sort/page query params; no server session for list state.
4. **Storefront hides exact stock** — OMS DTOs expose `inStock` only; IMS keeps numeric stock.
5. **Order snapshots** — Product name and unit price are stored on the order at placement time.
6. **Stock locking** — Place / cancel / adjust use pessimistic locks; delete is blocked while `CREATED` orders reference a product.
7. **Dummy users, not auth** — Header user switcher only; auth remains out of scope.
8. **Collapsible OMS sidebar** — Desktop OMS nav can collapse to an icon rail (preference stored in `localStorage`); mobile keeps the drawer menu.

---

## Project layout

```text
backend/     Spring Boot API + packaged UI (Docker)
frontend/    React + Vite + HeroUI (dev / Docker build stage)
PRODUCT.md   Functional specification
TASKS.md     Take-home requirements
ai-prompt.log  AI interaction log (required by TASKS)
```

---

## Troubleshooting

- **Port already allocated** — Change the left-hand side of the Compose mappings (e.g. `"28081:18081"`) and open that host port instead; keep container port `18081` unless you also change `server.port` / `EXPOSE`.
- **Empty UI after schema changes** — Run `docker-compose down -v` once, then `up --build` so Postgres recreates and the demo seeder runs.
- **API only, blank page** — Rebuild so the frontend stage copies into `static/` (`docker-compose up --build`).
