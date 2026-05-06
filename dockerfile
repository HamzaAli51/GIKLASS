# Stage 1 - Base Environment
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment variable to ensure production logic is used
ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy your specific project files
# Ensure 'index.html' is in your root folder
COPY index.html ./index.html
COPY server.ts ./server.ts
COPY src/ ./src/

# Install tsx to run the TypeScript server logic
RUN npm install tsx

# Expose Port 3000 as per project requirements
EXPOSE 3000

# Start the application
CMD ["npx", "tsx", "server.ts"]