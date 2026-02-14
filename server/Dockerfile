FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled source and migrations
COPY dist/ ./dist/
COPY drizzle/ ./drizzle/

# Create photo storage directory
RUN mkdir -p /data/photos

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
