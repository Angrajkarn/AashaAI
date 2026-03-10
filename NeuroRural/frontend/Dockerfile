# Minimal production Dockerfile — uses pre-built .next output (built locally)
# This avoids heavy npm install inside Docker, preventing memory crashes.
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Copy only what's needed to run the pre-built Next.js app
COPY package.json ./
COPY node_modules ./node_modules
COPY .next ./.next
COPY public ./public
COPY next.config.* ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node_modules/.bin/next", "start", "-p", "3000"]
