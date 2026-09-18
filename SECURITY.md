# Security

LocalCode executes submitted Java, JavaScript, and Python code. The current runner is intended for a single trusted user on a private machine or LAN.

Do not expose the runner directly to the public internet. A public or multi-user deployment needs a separate per-submission sandbox with network isolation, filesystem isolation, process limits, and disposable execution environments.

The provided Compose configuration reduces host access by using a read-only root filesystem, dropped Linux capabilities, resource limits, and persistent named volumes. These controls do not turn the in-process runner into a hostile-code sandbox.

Do not commit problem snapshots, personal solutions, SQLite files, credentials, or `.env` files. Report security issues privately to the repository owner rather than opening a public issue.
