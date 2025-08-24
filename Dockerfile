# -------------------------
# Stage 1: Build frontend + install dependencies
# -------------------------
FROM node:24.5.0 AS node-builder

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build || echo "No frontend build step found"


# -------------------------
# Stage 2: PHP + Composer
# -------------------------
FROM php:8.4-cli AS php-runtime

# Install required PHP extensions & system deps
RUN apt-get update && apt-get install -y \
    unzip git curl sqlite3 libsqlite3-dev libzip-dev \
    && docker-php-ext-install pdo pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.8.3 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application code
COPY . .

# Copy built frontend (if any)
COPY --from=node-builder /app/public ./public

# Install PHP dependencies (include dev)
RUN composer install --no-interaction --prefer-dist --no-scripts

# Ensure Laravel storage & cache dirs are writable
RUN mkdir -p storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Run migrations + seed on container start
# Using entrypoint for dynamic DB readiness
COPY <<EOF /usr/local/bin/start-container
#!/bin/sh
set -e

# Ensure SQLite file exists
touch /var/www/html/database/database.sqlite
chmod 664 /var/www/html/database/database.sqlite

# Run migrations + seed
php artisan migrate --force --seed

# Start Laravel server on Render's expected port
php artisan serve --host=0.0.0.0 --port=10000
EOF

RUN chmod +x /usr/local/bin/start-container

EXPOSE 10000

ENTRYPOINT ["start-container"]
