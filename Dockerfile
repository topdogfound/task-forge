# -------------------------
# Stage 1: Node build
# -------------------------
FROM node:24.5.0 AS node-builder

WORKDIR /app

# Copy only dependency files first for caching
COPY package*.json vite.config.* postcss.config.* tailwind.config.* ./
RUN npm install --include=dev

# Copy rest of the project
COPY . .

# Try to build assets, if no build script exists -> just make empty build dir
RUN npm run build || (echo "⚠️ Skipping npm build, creating empty build folder" && mkdir -p public/build)


# -------------------------
# Stage 2: PHP runtime + Composer
# -------------------------
FROM php:8.4-cli AS php-runtime

# Install system dependencies & PHP extensions
RUN apt-get update && apt-get install -y \
    unzip git curl sqlite3 libsqlite3-dev libzip-dev \
    && docker-php-ext-install pdo pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.8.3 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application source
COPY . .

# Copy built frontend assets (if they exist)
COPY --from=node-builder /app/public/build ./public/build

# Install PHP dependencies including dev
RUN composer install --no-interaction --prefer-dist --no-scripts

# Ensure writable dirs + SQLite DB
RUN mkdir -p storage bootstrap/cache database \
    && touch database/database.sqlite \
    && chmod -R 775 storage bootstrap/cache database \
    && chmod 664 database/database.sqlite \
    && chown -R www-data:www-data storage bootstrap/cache database

# Startup script: migrate + seed + run server
COPY <<EOF /usr/local/bin/start-container
#!/bin/sh
set -e

# Ensure SQLite file exists
touch /var/www/html/database/database.sqlite
chmod 664 /var/www/html/database/database.sqlite

# Run migrations & seeding
php artisan migrate --force --seed

# Start Laravel on Render port
php artisan serve --host=0.0.0.0 --port=10000
EOF

RUN chmod +x /usr/local/bin/start-container

EXPOSE 10000

ENTRYPOINT ["start-container"]
