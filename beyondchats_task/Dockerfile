# Use PHP 8.2 with Apache
FROM php:8.2-apache

# 1. Install development packages and clean up apt cache
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
 && docker-php-ext-install zip pdo pdo_pgsql

# 2. Apache Configuration
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# 3. Enable Apache mod_rewrite
RUN a2enmod rewrite

# 4. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Set working directory
WORKDIR /var/www/html

# 6. Copy project files
COPY . .

# 7. Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# 8. Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# ----------------------------------------------------
# NEW: Create a startup script inside the image
# This avoids "command not found" errors on Render
# ----------------------------------------------------
RUN echo '#!/bin/sh' > /start.sh \
    && echo 'php artisan migrate --force' >> /start.sh \
    && echo 'apache2-foreground' >> /start.sh \
    && chmod +x /start.sh

# Tell Docker to run this script when the container starts
CMD ["/start.sh"]