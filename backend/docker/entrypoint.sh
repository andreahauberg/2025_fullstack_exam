#!/bin/sh
set -e
cd /var/www/html

# Vent lidt på at netværket er klar
sleep 10

# Opret storage symlink (hvis den ikke eksisterer)
if [ ! -L public/storage ]; then
    echo "Opretter storage symlink..."
    php artisan storage:link
fi

echo "Starter Apache..."
exec "$@"
