#!/usr/bin/env bash
set -e  # Exit on error

echo "Running composer..."
composer install --no-dev --working-dir=/var/www

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force
php artisan db:seed

echo "Starting php-fpm..."
exec php-fpm -F -R --listen=0.0.0.0:10000
