FROM php:8.2-apache

# System dependencies
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
RUN docker-php-ext-install pdo pdo_mysql mbstring bcmath xml zip
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
 && docker-php-ext-install gd

# Apache rewrite
RUN a2enmod rewrite

# Arbejdsmappe til Laravel
WORKDIR /var/www/html

# Apache-konfiguration
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Entrypoint-script (migrations, storage:link osv.)
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Installer Composer
RUN curl -sS https://getcomposer.org/installer \
    | php -- --install-dir=/usr/local/bin --filename=composer

# Copy composer-filer først (bedre cache)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Copy resten af app’en
COPY . .

# Sørg for at public-mappen matcher DocumentRoot
RUN mkdir -p /var/www/html/public

ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]