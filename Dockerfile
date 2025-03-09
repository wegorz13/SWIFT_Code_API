FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
