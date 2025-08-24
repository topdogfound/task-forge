# -------------------------
# Stage 1: Build frontend + install dependencies
# -------------------------
FROM node:24.5.0 AS node-builder

WORKDIR /app

# Copy only dependency files first (better caching)
COPY package*.json vite.config.* postcss.config.* tailwind.config.* ./
RUN npm install --include=dev

# Copy rest of project
COPY . .

# Build frontend assets into /app/public/build
RUN npm run build


# -------------------------
# Stage 2: PHP + Composer runtime
# -------------------------
FROM php:8.4-cli AS php-runtime

# Install required system packages & PHP extensions
RUN apt-get update && apt-get install -y \
    unzip git curl sqlite3 libsqlite3-dev libzip-dev \
    && docker-php-ext-install pdo pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.8.3 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application code
COPY . .

# Copy only the built Vite assets
COPY --from=node-builder /app/public/build ./public/build

# Install PHP dependencies (including dev)
RUN composer install --no-interaction --prefer-dist --no-scripts

# Ensure Laravel storage, cache, and DB are writable
RUN mkdir -p storage bootstrap/cache database \
    && touch database/database.sqlite \
    && chmod -R 775 storage bootstrap/cache database \
    && chmod 664 database/database.sqlite \
    && chown -R www-data:www-data storage bootstrap/cache database

# Startup script: run migrations/seed, then start Laravel
COPY <<EOF /usr/local/bin/start-container
#!/bin/sh
set -e

# Ensure SQLite DB exists
touch /var/www/html/database/database.sqlite
chmod 664 /var/www/html/database/database.sqlite

# Run migrations + seed
php artisan migrate --force --seed

# Serve Laravel on Render's port
php artisan serve --host=0.0.0.0 --port=10000
EOF

RUN chmod +x /usr/local/bin/start-container

EXPOSE 10000

ENTRYPOINT ["start-container"]
