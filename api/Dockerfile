FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create logs directory
RUN mkdir -p /app/logs

EXPOSE 3000

CMD ["node", "src/index.js"]