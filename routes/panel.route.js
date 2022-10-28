const mongoose = require('mongoose');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const {
  PostModel,
  UserModel,
  NoticeModel,
  EventModel,
  ClubModel,
  ConsultantModel,
  DirectoryModel,
  FriendModel,
} = require('../database/models/schemas');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/profile', async (req, res) => {
  const { user } = req.session;
  const userInfo = await UserModel.findById(user.id).lean();
  return res.render('panel/profile', { userInfo });
});

router.post('/profile', async (req, res) => {
  const { user } = req.session;
  const { original, password } = req.body;
  const userInfo = await UserModel.findById(user.id).lean();
  if (bcrypt.compareSync(original, userInfo.password)) {
    await UserModel.findByIdAndUpdate(
      user.id,
      { password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)) },
    );
    return res.render('panel/profile', { userInfo, name: 'Actualizacion de contraseña', message: 'Se actualizo correctamente la contraseña' });
  }
  return res.render('panel/profile', { userInfo, name: 'Actualizacion de contraseña', errorAlert: 'La contraseña es incorrecta' });
});

router.get('/', async (req, res) => {
  const { page } = req.query;
  const posts = await PostModel
    .find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await PostModel.find().count();
  const pages = Math.ceil(count / 10);
  res.render('panel/index', {
    posts, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.post('/', async (req, res) => {
  const { user } = req.session;
  const { content } = req.body;
  if (!user || !content) {
    return res.render('panel/index', { name: 'Agregar publicacion', errorAlert: 'Error en el formulario' });
  }
  await PostModel.create({ content, user: user.id });
  const { page } = req.query;
  const posts = await PostModel
    .find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await PostModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/index', {
    posts, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findById(id).lean();
  const numPosts = await PostModel.find({ user: user._id }).count();
  res.render('panel/user', { user, numPosts: numPosts ?? 0 });
});

router.get('/notice', async (req, res) => {
  const { page } = req.query;
  const notices = await NoticeModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await NoticeModel.find().count();
  const pages = Math.ceil(count / 10);
  res.render('panel/notice', {
    notices, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.post('/notice', async (req, res) => {
  const { page } = req.query;
  const { user } = req.session;
  const { title, content } = req.body;
  if (!user || !title || !content) {
    return res.render('panel/notice', { name: 'Agregar noticia', errorAlert: 'Error en el formulario' });
  }
  await NoticeModel.create({ user: user.id, title, content });
  const notices = await NoticeModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await NoticeModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/notice', {
    notices, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.get('/events', async (req, res) => {
  const { page } = req.query;
  const events = await EventModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await EventModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/events', {
    events, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.post('/events', async (req, res) => {
  const { page } = req.query;
  const { user } = req.session;
  const { title, content, date } = req.body;
  if (!user || !title || !content || !date) {
    return res.render('panel/events', { name: 'Agregar evento', errorAlert: 'Error en el formulario' });
  }
  await EventModel.create({
    user: user.id, title, content, date,
  });
  const events = await EventModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await EventModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/events', {
    events, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.post('/events/participe/:id', async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;
  const { user } = req.session;
  const exist = await EventModel.find(
    { _id: id, participants: { $in: [new mongoose.Types.ObjectId(user.id)] } },
  ).exec();
  if (exist.length > 0) {
    return res.render('panel/events', { name: 'Participar en evento', errorAlert: 'Usted ya esta participando en este evento' });
  }
  await EventModel.findByIdAndUpdate(id, {
    $push: {
      participants: new mongoose.Types.ObjectId(user.id),
    },
  }).lean();
  const events = await EventModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await EventModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/events', {
    events, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.get('/ocio', async (req, res) => {
  const { page } = req.query;
  const clubs = await ClubModel.find({ type: 'ocio' })
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await ClubModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/club', {
    clubs, count: count ?? 0, pages, page: page ?? 0, type: 'ocio',
  });
});

router.post('/ocio', async (req, res) => {
  const { page } = req.query;
  const { user } = req.session;
  const {
    name, description, checkin, departure, days, type,
  } = req.body;
  console.log(req.body);
  if (!user || !name || !description || !checkin || !departure || !days || !type) {
    return res.render('panel/club', { name: 'Agregar Club', errorAlert: 'Error en el formulario' });
  }
  await ClubModel.create({
    user: user.id,
    name,
    description,
    checkin,
    departure,
    days,
    type,
    participants: [new mongoose.Types.ObjectId(user.id)],
  });
  const clubs = await ClubModel.find({ type: 'ocio' })
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await ClubModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/club', {
    clubs, count: count ?? 0, pages, page: page ?? 0, type: 'ocio',
  });
});

router.post('/ocio/participe/:id', async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;
  const { user } = req.session;
  const exist = await ClubModel.find(
    { _id: id, participants: { $in: [new mongoose.Types.ObjectId(user.id)] } },
  ).exec();
  if (exist.length > 0) {
    return res.render('panel/club', { name: 'Participar en el club', errorAlert: 'Usted ya esta participando en este evento' });
  }
  await ClubModel.findByIdAndUpdate(id, {
    $push: {
      participants: new mongoose.Types.ObjectId(user.id),
    },
  }).lean();
  const clubs = await ClubModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await ClubModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/club', {
    clubs, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.get('/estudio', async (req, res) => {
  const { page } = req.query;
  const clubs = await ClubModel.find({ type: 'estudio' })
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await ClubModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/club', {
    clubs, count: count ?? 0, pages, page: page ?? 0, type: 'estudio',
  });
});

router.post('/estudio', async (req, res) => {
  const { page } = req.query;
  const { user } = req.session;
  const {
    name, description, checkin, departure, days, type,
  } = req.body;
  console.log(req.body);
  if (!user || !name || !description || !checkin || !departure || !days || !type) {
    return res.render('panel/club', { name: 'Agregar Club', errorAlert: 'Error en el formulario' });
  }
  await ClubModel.create({
    user: user.id,
    name,
    description,
    checkin,
    departure,
    days,
    type,
    participants: [new mongoose.Types.ObjectId(user.id)],
  });
  const clubs = await ClubModel.find({ type: 'estudio' })
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await ClubModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/club', {
    clubs, count: count ?? 0, pages, page: page ?? 0, type: 'estudio',
  });
});

router.post('/estudio/participe/:id', async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;
  const { user } = req.session;
  const exist = await ClubModel.find(
    { _id: id, participants: { $in: [new mongoose.Types.ObjectId(user.id)] } },
  ).exec();
  if (exist.length > 0) {
    return res.render('panel/club', { name: 'Participar en el club', errorAlert: 'Usted ya esta participando en este evento' });
  }
  await ClubModel.findByIdAndUpdate(id, {
    $push: {
      participants: new mongoose.Types.ObjectId(user.id),
    },
  }).lean();
  const clubs = await ClubModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await ClubModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/club', {
    clubs, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.get('/consultant', async (req, res) => {
  const { page } = req.query;
  const consultants = await ConsultantModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await ConsultantModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/consultant', {
    consultants, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.post('/consultant', async (req, res) => {
  const { page } = req.query;
  const { user } = req.session;
  const {
    name, description, checkin, departure, days,
  } = req.body;
  if (!user || !name || !description || !checkin || !departure || !days) {
    return res.render('panel/consultant', { name: 'Agregar Club', errorAlert: 'Error en el formulario' });
  }
  await ConsultantModel.create({
    user: user.id,
    name,
    description,
    checkin,
    departure,
    days,
    participants: [new mongoose.Types.ObjectId(user.id)],
  });
  const consultants = await ConsultantModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .populate({ path: 'participants', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await ConsultantModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/consultant', {
    consultants, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.get('/directory', async (req, res) => {
  const { page } = req.query;
  const directorys = await DirectoryModel.find()
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await DirectoryModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/directory', {
    directorys, count: count ?? 0, pages, page: page ?? 0,
  });
});

router.get('/friend', async (req, res) => {
  const { page } = req.query;
  const friends = await FriendModel.find({ user: req.session.user.id })
    .limit(10)
    .skip((page && page * 10) ?? 0)
    .sort('-_id')
    .populate({ path: 'user', model: UserModel, select: '_id fullname email' })
    .lean();
  const count = await FriendModel.find().count();
  const pages = Math.ceil(count / 10);
  return res.render('panel/friend', {
    friends, count: count ?? 0, pages, page: page ?? 0,
  });
});

module.exports = router;
