FROM node:18-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Compilation du projet
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]