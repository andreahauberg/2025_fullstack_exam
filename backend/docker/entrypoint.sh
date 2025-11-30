#!/bin/sh
set -e

cd /var/www/html

# Run migrations before starting Apache
php artisan migrate --force

# Start Apache (default CMD from php:apache)
exec "$@"
