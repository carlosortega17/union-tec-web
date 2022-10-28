const router = require('express').Router();
const bcrypt = require('bcrypt');
const { UserModel } = require('../database/models/schemas');
const { noAuthMiddleware } = require('../middlewares/auth.middleware');

router.get('/', noAuthMiddleware, (req, res) => {
  res.render('home/login');
});

router.post('/', noAuthMiddleware, async (req, res) => {
  const { body: { email, password } } = req;
  if (!email && !password) {
    return res.render('home/login', { error: 'El formulario no es correcto' });
  }

  const user = await UserModel.findOne({ email }).exec();

  if (!user) {
    return res.render('home/login', { error: 'El usuario no esta registrado' });
  }

  const hashPassword = bcrypt.compareSync(password, user.password);

  if (!hashPassword) {
    return res.render('home/login', { error: 'Contraseña incorrecta' });
  }
  req.session.user = { id: user._id, email: user.email };
  return res.redirect('/panel');
});

router.get('/register', noAuthMiddleware, (req, res) => res.render('home/register'));

router.post('/register', noAuthMiddleware, async (req, res) => {
  const {
    body: {
      numcontrol, fullname, email, password,
    },
  } = req;
  if (!numcontrol && !fullname && !email && !password) {
    return res.render('home/register', { error: 'El formulario no es valido' });
  }

  const user = await UserModel.findOne({ email }).exec();

  if (user) {
    return res.render('home/register', { error: 'El usuario ya se encuentra registrado' });
  }

  await UserModel.create({
    numcontrol,
    fullname,
    email,
    password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
  });
  return res.render('home/register', { message: 'Usuario creado correctamente' });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
