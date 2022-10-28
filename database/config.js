const mongoose = require('mongoose');

const CONN_URL = process.env.CONN_URL ?? 'mongo://localhost:27017/unionTec';

mongoose.connect(CONN_URL);

const { connection } = mongoose;

connection.on('open', () => {
  console.log('Success db connection');
});
connection.on('error', (err) => {
  if (err) {
    throw err;
  }
});

module.exports = connection;
