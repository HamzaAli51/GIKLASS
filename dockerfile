# Stage 1 - Build frontend
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
RUN npm install --omit=dev

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server files
COPY --from=builder /app/server.ts ./server.ts

# Install tsx to run TypeScript server
RUN npm install tsx

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]