# Stage 1 - Frontend Build
FROM node:24.5.0-alpine AS frontend
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Stage 2 - Backend
FROM php:8.4.1-fpm-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    git \
    curl \
    zip \
    unzip \
    sqlite \
    sqlite-dev \
    oniguruma-dev \
    libzip-dev \
    && docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_sqlite \
    mbstring \
    zip

# Install Composer
COPY --from=composer:2.8.3 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Create non-root user for security
RUN addgroup -g 1000 -S www && \
    adduser -u 1000 -D -S -G www www

# Copy application files
COPY --chown=www:www . .

# Copy frontend build from previous stage
COPY --from=frontend --chown=www:www /app/dist ./public/build

# Create SQLite database directory with proper permissions
RUN mkdir -p database && \
    touch database/database.sqlite && \
    chown -R www:www database && \
    chmod -R 775 database

# Install PHP dependencies
RUN composer install --no-dev --no-interaction --optimize-autoloader --no-cache

# Configure PHP-FPM to listen on port 10000
RUN sed -i 's/listen = 127.0.0.1:9000/listen = 0.0.0.0:10000/' /usr/local/etc/php-fpm.d/www.conf

# Copy and set up entrypoint
COPY --chown=www:www entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Switch to non-root user
USER www

# Expose port
EXPOSE 10000

# Set entrypoint and command
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm", "-F"]