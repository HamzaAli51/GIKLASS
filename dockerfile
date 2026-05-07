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

# Copy the source folder so server.ts can find its imports
COPY --from=builder /app/src ./src
# Copy the entry point
COPY --from=builder /app/server.ts ./server.ts

# Install tsx to run TypeScript server
RUN npm install tsx

# Set production environment and expose port
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["npx", "tsx", "server.ts"]