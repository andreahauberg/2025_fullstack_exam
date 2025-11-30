#!/bin/sh
set -e

cd /var/www/html

# Run migrations before starting Apache
php artisan migrate --force

# Optionally seed (set SEED_ON_BOOT=1 in env for one-off seeding)
if [ "${SEED_ON_BOOT}" = "1" ]; then
    php artisan db:seed --force
fi

# Start Apache (default CMD from php:apache)
exec "$@"
