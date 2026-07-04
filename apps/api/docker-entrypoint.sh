#!/bin/sh
set -e

cd /app

echo "Running database schema sync..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  npx prisma db push --skip-generate
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed
fi

exec "$@"
