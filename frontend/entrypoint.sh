#!/bin/sh

# Generate runtime environment config for the React app
# This runs at container startup, injecting env vars into a JS file
# that the browser loads before React initializes.

cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  REACT_APP_BACKEND_URL: "${REACT_APP_BACKEND_URL}"
};
EOF

echo "Runtime env-config.js generated with REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}"

# Start nginx
exec nginx -g 'daemon off;'
