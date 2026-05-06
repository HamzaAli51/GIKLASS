# Stage 1 - Build (No changes needed here)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - Run server
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# --- FIX START ---
# Copy the source folder so server.ts can find its imports
COPY --from=builder /app/src ./src
# Copy the entry point
COPY --from=builder /app/server.ts ./server.ts
# --- FIX END ---

# Install tsx to run TypeScript server
RUN npm install tsx

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]