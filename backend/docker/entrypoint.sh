#!/bin/sh
set -e
cd /var/www/html

# Vent lidt på at netværket er klar
sleep 10

# Kør migrations, hvis migrations-tabellen ikke eksisterer eller er tom
if ! php artisan migrate:status | grep -q "batch"; then
    echo "Kører migrations..."
    php artisan migrate --force
else
    echo "Migrations er allerede kørt."
fi

# Opret storage symlink (hvis den ikke eksisterer)
if [ ! -L public/storage ]; then
    echo "Opretter storage symlink..."
    php artisan storage:link
fi

echo "Starter Apache..."
exec "$@"
