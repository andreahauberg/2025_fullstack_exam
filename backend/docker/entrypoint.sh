#!/bin/sh
set -e
cd /var/www/html

# Tjek om migrations-tabellen eksisterer og har data
if ! php artisan migrate:status | grep -q "batch"; then
    echo "Kører migrations..."
    php artisan migrate --force
else
    echo "Migrations er allerede kørt."
fi

# Opret storage symlink (hvis den ikke eksisterer)
if [ ! -L public/storage ]; then
    php artisan storage:link
fi

# Kør seeders, hvis SEED_ON_BOOT=1 er sat
if [ "${SEED_ON_BOOT}" = "1" ]; then
    echo "Kører seeders..."
    php artisan db:seed --force
fi

# Start Apache
exec "$@"
