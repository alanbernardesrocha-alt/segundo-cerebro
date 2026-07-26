#!/bin/sh
set -e

mkdir -p /data
mkdir -p "${UPLOAD_DIR:-/data/uploads}"

npx prisma migrate deploy

exec "$@"
