# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build argument with default value - works even without Easypanel build args configured
ARG REACT_APP_BACKEND_URL=https://app-backend.2fus23.easypanel.host
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Reduce memory usage: disable source maps and limit Node heap to 512MB
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=512

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
