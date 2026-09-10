#!/usr/bin/env bash
#
# Seed a hosted database from data/migration/, given its URL in the environment.
#
#   DATABASE_URL="postgresql://…" ./scripts/seed-remote.sh
#
# Exists because pasting Neon's connection string straight into `npm run db:seed`
# fails twice over, and neither error says why:
#
#   1. Neon hands out `channel_binding=require`. Prisma's Rust driver does not
#      speak SCRAM channel binding and reports the failed handshake as
#      "Can't reach database server", which sends you hunting a network fault
#      that isn't there.
#   2. The pooled `-pooler` host runs pgbouncer in transaction mode, which
#      cannot hold the prepared statements Prisma opens. Fine for the running
#      site, wrong for a seed — so this uses the direct endpoint instead.
#
# It also raises connect_timeout, because Neon suspends an idle compute and the
# 5s default can expire while it is still waking up.
#
# Nothing here is printed that could leak: only the host is echoed, never the
# password.
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set." >&2
  echo "Usage: DATABASE_URL=\"postgresql://…\" $0" >&2
  exit 1
fi

if [[ "$DATABASE_URL" != postgres://* && "$DATABASE_URL" != postgresql://* ]]; then
  echo "DATABASE_URL does not look like a Postgres URL (must start postgresql:// or postgres://)." >&2
  echo "If you piped this from another command, that command probably returned an error instead of a value." >&2
  exit 1
fi

url="$DATABASE_URL"
url="${url//&channel_binding=require/}"
url="${url//?channel_binding=require&/?}"
url="${url//-pooler./.}"                      # direct endpoint, no pgbouncer
[[ "$url" == *connect_timeout=* ]] || url="${url}&connect_timeout=20"

# host only — everything before "@" is credentials
host="${url#*@}"
host="${host%%\?*}"
echo "seeding  ->  ${host}"
echo

export PATH="/Users/siyandaedwana/.nvm/versions/node/v24.14.0/bin:$PATH"
DATABASE_URL="$url" npm run db:seed
