#!/bin/sh
set -e
cd /var/www/html
# Start Apache uden migrations
exec "$@"


# #!/bin/sh
# set -e
# cd /var/www/html
# # Kør migrations før Apache startes
# php artisan migrate --force
# # Opret storage symlink (idempotent)
# if [ ! -L public/storage ]; then
#     php artisan storage:link
# fi
# # Optionelt seed (sæt SEED_ON_BOOT=1 i miljøvariabler for at køre seedere)
# if [ "${SEED_ON_BOOT}" = "1" ]; then
#     php artisan db:seed --force
# fi
# # Start Apache
# exec "$@"
