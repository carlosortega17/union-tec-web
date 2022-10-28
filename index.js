const dotenv = require('dotenv');
const handlebars = require('express-handlebars');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const app = express();
const cors = require('cors');
const path = require('path');
const methodOverride = require('method-override');

dayjs.extend(localizedFormat);
dotenv.config();
require('./database/config');

const HTTP_PORT = process.env.PORT ?? 8080;

// MIDDLEWARES
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(flash());
app.use(methodOverride('_method'));
app.use(cors());

// EXPRESS SESSION
app.use(session({
  secret: process.env.SESSION_SECRET ?? 'secretkey',
  resave: true,
  saveUninitialized: true,
}));

// HANDLEBARS CONFIG
app.set('views', 'views');
app.engine('hbs', handlebars.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  extname: '.hbs',
  helpers: {
    formatName: (nameString) => {
      const tmp = String(nameString);
      const dc = tmp.split(' ');
      if (dc.length === 2) {
        return `${dc[0]} ${dc[1]}`;
      }
      if (dc.length === 3) {
        return `${dc[0]} ${dc[1]}`;
      }
      if (dc.length === 4) {
        return `${dc[0]} ${dc[2]}`;
      }
      return '';
    },
    formatDate: (dateString) => dayjs(dateString).format('L'),
    back: (num) => {
      num = parseInt(num, 10);
      if (num > 0) {
        return num - 1;
      }
      return num;
    },
    next: (num, max) => {
      num = parseInt(num, 10);
      max = parseInt(max, 10);
      if (num >= 0 && num < max) {
        return num + 1;
      }
      return num;
    },
  },
}));
app.set('view engine', 'hbs');

app.use('/', require('./routes/home.route'));
app.use('/panel', require('./routes/panel.route'));

app.use('*', (_, res) => res.render('errors/notFound'));

// SERVER INIT
app.listen(HTTP_PORT, () => {
  console.log(`HTTP SERVER LISTEN ON http://localhost:${HTTP_PORT}`);
});
