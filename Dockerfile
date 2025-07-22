FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source files
COPY . .

# Build the project using standalone config
RUN bun x tsc -p tsconfig.standalone.json && chmod +x dist/*.js

FROM oven/bun:1-alpine AS release

WORKDIR /app

# Copy built files and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bun.lockb* ./

# Install production dependencies only
ENV NODE_ENV=production
RUN bun install --production

# Run the server
ENTRYPOINT ["bun", "dist/index.js"]
