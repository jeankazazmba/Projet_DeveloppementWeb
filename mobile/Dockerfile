FROM node:24-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

EXPOSE 8081 19000 19001
CMD ["npx", "expo", "start", "--lan"]
