FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
#COPY . .
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV FAST_REFRESH=true
#ENV PATH /app/node_modules/.bin:$PATH
EXPOSE 3000
CMD ["npm", "start"]