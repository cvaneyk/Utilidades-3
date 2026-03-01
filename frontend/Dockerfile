# Simple deployment - no build step needed, app is pre-built locally
# Just copy the pre-built static files into nginx
FROM nginx:alpine

# Copy pre-built React app
COPY build/ /usr/share/nginx/html/

# Copy nginx configuration (includes /api/ reverse proxy to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
