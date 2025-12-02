FROM php:8.2-apche

# Installer systemafhængigheder
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
    default-mysql-client

# Installer og konfigurer PHP-udvidelser
RUN docker-php-ext-install pdo pdo_mysql mbstring bcmath xml
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && docker-php-ext-install gd
RUN docker-php-ext-install zip

# Installer Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Aktiver Apache rewrite-modulet
RUN a2enmod rewrite

# Kopier Apache-konfiguration
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Kopier projektfiler
WORKDIR /var/www/html
COPY . .

# Installer Composer-afhængigheder
RUN composer install --no-dev --optimize-autoloader

# Kør Laravel kommandoer
RUN php artisan key:generate
RUN php artisan config:clear
RUN php artisan migrate --force

# Sæt rettigheder for Laravel storage
RUN chown -R www-data:www-data /var/www/html/storage
RUN chmod -R 775 /var/www/html/storage

# Start Apache
CMD ["apache2-foreground"]
