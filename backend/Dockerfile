# Backend Dockerfile
FROM node:18-alpine

# Build argument to enable/disable linting, formatting, and test checks
ARG RUN_LINT=true
ARG RUN_FORMAT_CHECK=true
ARG RUN_TESTS=true

# Set working directory
WORKDIR /app

# Copy package files and lockfile from root
COPY package*.json package-lock.json ./

# Copy backend directory
COPY backend/ ./

# Install all dependencies (including dev dependencies for building)
RUN npm install --legacy-peer-deps

# Run linting and formatting checks (can be disabled via build args)
RUN if [ "$RUN_LINT" = "true" ]; then npm run lint; fi
RUN if [ "$RUN_FORMAT_CHECK" = "true" ]; then npm run format:check; fi

# Run tests (can be disabled via build args)
RUN if [ "$RUN_TESTS" = "true" ]; then npm run test; fi

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8080

# Set environment
ENV PORT=8080

# Start the application
CMD ["npm", "run", "start:prod"]
