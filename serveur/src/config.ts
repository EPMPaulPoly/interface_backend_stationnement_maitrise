import dotenv from 'dotenv';

dotenv.config({path: '../.env'});
console.log(process.env.DB_USER);
export default {
  database: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  },
  server: {
    port: parseInt(process.env.SERVER_PORT || '3001'),
  }
};