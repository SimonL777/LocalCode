# LocalCode

[![CI](https://github.com/SimonL777/LocalCode/actions/workflows/ci.yml/badge.svg)](https://github.com/SimonL777/LocalCode/actions/workflows/ci.yml)

LocalCode is a self-hosted algorithm practice workbench with local execution, SQLite persistence, and IDE-grade language intelligence for Java, JavaScript, and Python.

It ships with an original five-problem demo catalog. Personal or licensed problem catalogs can be mounted at runtime and stay outside the repository.

## One-command deployment

Docker Engine with Compose is the recommended path for a NAS or home server:

```bash
git clone https://github.com/SimonL777/LocalCode.git
cd LocalCode
./scripts/deploy.sh
```

Open `http://<NAS-IP>:8787`. The script creates `.env`, builds the image, downloads the pinned JDT LS runtime, starts the service, and waits for the health check.

Useful commands:

```bash
docker compose logs -f localcode
./scripts/stop.sh
docker compose up -d --build
```

SQLite data is stored in the `localcode-data` named volume. JDT LS caches use a separate disposable volume.

### Mount a private problem catalog

Edit `.env` after the first deployment:

```dotenv
LOCALCODE_PORT=8787
PROBLEM_DATA_DIR=/absolute/path/to/problem-data
```

The mounted directory must contain:

```text
problem-data/
├── 题源索引.json
└── 题面/
    ├── 0001-example.md
    └── ...
```

Each index entry needs `id`, `title`, `difficulty`, `date`, `pattern`, `core16`, and `local_file`. Markdown starter code is read from the `### Java` and `### Python3` sections. The directory is mounted read-only.

After changing `.env`:

```bash
docker compose up -d --force-recreate
```

## Local installation

Requirements:

- Node.js 22.5 or newer
- Java/Javac
- Python 3
- `tar`

One-command production-style local start:

```bash
./scripts/local-start.sh
```

Development mode:

```bash
npm install
npm run setup:intelligence
npm run dev
```

The UI runs at `http://localhost:5173` in development. The API listens on port `8787`.

## Language intelligence

- Java: Eclipse JDT LS for semantic completion, automatic imports, signature help, hover documentation, and diagnostics
- Python: Pyright for type-aware completion, signature help, hover information, and diagnostics
- JavaScript: Monaco's TypeScript language service with syntax and semantic validation
- Handwritten algorithm snippets remain available as low-priority templates

`npm run setup:intelligence` installs the pinned JDT LS release outside Git. Set `JDTLS_JAVA`, `JDTLS_HOME`, or `LOCALCODE_JAVA_HOME` to override the detected runtimes.

## Storage and execution

Solutions, progress, timers, and attempt history are stored in SQLite. The default local path is `.localcode/localcode.db`; override it with `LOCALCODE_DB_PATH`.

The runner uses local Java, Node.js, and Python processes with timeouts. The Compose deployment adds a read-only root filesystem, dropped capabilities, and resource limits, but the runner is still intended for code written by a trusted single user.

**Do not expose the current runner directly to the public internet.** A public or multi-user deployment requires a separate disposable sandbox per submission. See [SECURITY.md](SECURITY.md).

## Current scope

- Java, JavaScript, and Python editing with autosave
- Semantic completion, imports, signatures, hover documentation, and diagnostics
- Debug suites with a few visible cases and submission suites with hidden boundary cases
- Runnable adapters for demo problem IDs `1`, `3`, `20`, `206`, and `704`
- SQLite-backed solutions, progress, timing, and attempt history
- Optional hints and reference implementations when supplied by the local catalog

## Open-source boundary

The application, deployment files, and original demo catalog are open source under the MIT License. Third-party problem statements, personal solutions, private study schedules, and SQLite data are not part of the repository.
