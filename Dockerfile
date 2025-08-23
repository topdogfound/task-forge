# Stage 1 - Frontend
FROM node:24.5.0 AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - Backend
FROM php:8.4.1-fpm

# Install dependencies + SQLite
RUN apt-get update && apt-get install -y \
    git curl unzip libonig-dev libzip-dev zip libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2.8.3 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy app + frontend build
COPY . .
COPY --from=frontend /app/dist ./public/build

# SQLite DB
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# Install PHP deps
RUN composer install --no-interaction --optimize-autoloader

# Entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Expose port
EXPOSE 10000

# CMD starts FPM separately
CMD ["php-fpm", "-F", "-R"]
