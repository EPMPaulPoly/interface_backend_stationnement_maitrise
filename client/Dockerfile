FROM node:20
WORKDIR /app
COPY package*.json ./
# Update npm to the latest version
RUN npm config set cache /app/.npm-cache --global
RUN npm install -g npm@11.0.0
RUN npm install
#COPY . .
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV FAST_REFRESH=true
#ENV PATH /app/node_modules/.bin:$PATH
EXPOSE 3000
CMD ["npm", "start"]