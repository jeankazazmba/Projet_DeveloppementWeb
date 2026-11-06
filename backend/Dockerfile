FROM php:8.3-cli-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends libonig-dev libzip-dev libsqlite3-dev \
    && docker-php-ext-install mbstring pdo_mysql pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY composer.json ./
RUN composer install --no-interaction --prefer-dist --no-progress --no-scripts
COPY . .
RUN composer dump-autoload --no-interaction --optimize --no-scripts \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R a+rwX storage bootstrap/cache
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
