# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build argument for backend URL (build-time fallback)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a simple entrypoint script using printf (no heredoc, no quoting issues)
RUN printf '#!/bin/sh\nprintf "window._env_ = { REACT_APP_BACKEND_URL: \\"%s\\" };\\n" "$REACT_APP_BACKEND_URL" > /usr/share/nginx/html/env-config.js\nexec nginx -g "daemon off;"\n' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Use entrypoint to inject env vars at runtime, then start nginx
CMD ["/entrypoint.sh"]
