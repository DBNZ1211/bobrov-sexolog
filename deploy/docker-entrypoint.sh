#!/bin/sh
set -eu

# Volume ./data is often root-owned on first deploy; app runs as node.
mkdir -p /app/data/uploads /app/data/previews
chown -R node:node /app/data
chmod -R u+rwX /app/data

exec runuser -u node -- "$@"
