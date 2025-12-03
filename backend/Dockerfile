FROM php:8.2-apache

# System deps
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libwebp-dev \
    default-mysql-client \
  && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring bcmath xml
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
  && docker-php-ext-install gd
RUN docker-php-ext-install zip

# Composer
RUN curl -sS https://getcomposer.org/installer \
  | php -- --install-dir=/usr/local/bin --filename=composer

# Apache rewrite
RUN a2enmod rewrite

# Workdir for Laravel
WORKDIR /var/www/html

# Kopiér HELE backend-koden ind først, inkl. artisan
COPY . .

# Installér PHP-dependencies (nu findes artisan, så scripts virker)
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Gør entrypoint eksekverbar
RUN chmod +x docker/entrypoint.sh

# Apache vhost-konfiguration
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Entrypoint: migrer, storage:link, seeding, og start Apache
ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["apache2-foreground"]