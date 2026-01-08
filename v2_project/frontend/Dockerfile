# Stage 1: Building the app
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PB_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PB_URL=$NEXT_PUBLIC_PB_URL
RUN npm run build

# Stage 2: Serve the app
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/postcss.config.js ./

EXPOSE 3000
CMD ["npm", "run", "start"]
