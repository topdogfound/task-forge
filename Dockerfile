# Stage 1 - Build Frontend (Vite)
FROM node:24.5.0 AS frontend
WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm install

# Copy frontend source and build
COPY . .
RUN npm run build

# Stage 2 - Backend (Laravel + PHP + Composer)
FROM php:8.4.1-fpm AS backend

# Install system dependencies + SQLite extension
RUN apt-get update && apt-get install -y \
    git curl unzip libonig-dev libzip-dev zip libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*


# Install Composer
COPY --from=composer:2.8.3 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy backend files
COPY . .

# Copy built frontend from Stage 1
COPY --from=frontend /app/dist ./public/build

# Ensure SQLite DB exists and writable
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# Expose PHP-FPM port
EXPOSE 10000

# Entrypoint
COPY <<EOF /usr/local/bin/entrypoint.sh
#!/usr/bin/env bash
set -e

echo "Running migrations and seeds..."
php artisan migrate --force
php artisan db:seed --force

echo "Starting php-fpm on port 10000..."
exec php-fpm -F -R --listen=0.0.0.0:10000
EOF

RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
