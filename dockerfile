# ===== BUILD STAGE =====
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Build the application
RUN npm run build

# ===== RUN STAGE =====
FROM nginx:stable-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]