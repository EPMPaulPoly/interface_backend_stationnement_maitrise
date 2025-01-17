FROM node:20
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
RUN npm install -g nodemon typescript ts-node
COPY . .
RUN npm run build
EXPOSE 5000 9229

CMD ["nodemon"]