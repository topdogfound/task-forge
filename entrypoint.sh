#!/usr/bin/env bash
set -e

echo "Running migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force

# Do not start PHP-FPM here
exec "$@"