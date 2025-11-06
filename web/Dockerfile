# Frontend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and lockfile from root
COPY package*.json package-lock.json ./

# Copy frontend directory
COPY web/ ./

# Install all dependencies (including dev dependencies for building)
RUN npm install --legacy-peer-deps

# Build the application with the API URL environment variable
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
