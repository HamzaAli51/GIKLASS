# Stage 1 - Build frontend and prepare source
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Generates the 'dist' folder for the frontend
RUN npm run build

# Stage 2 - Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Ensure Express serves the production build
ENV NODE_ENV=production

# Install only production dependencies to save space
COPY package*.json ./
RUN npm install --omit=dev

# Copy build artifacts and necessary source files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./server.ts

# Install tsx to execute the TypeScript server
RUN npm install tsx

# Expose the internal container port
EXPOSE 3000

# Start the application
CMD ["npx", "tsx", "server.ts"]