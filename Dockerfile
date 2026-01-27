FROM node:20

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer dépendances + Angular CLI global
RUN npm install -g @angular/cli
RUN npm install

# Copier tout le projet
COPY . .

# Exposer le port Angular
EXPOSE 4200

# Démarrage du serveur Angular
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
