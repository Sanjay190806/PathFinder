FROM node:18-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (including production ones)
RUN npm ci

# Copy codebase and schema
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Generate Prisma Client classes
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --production

EXPOSE 5000

CMD ["npm", "start"]
