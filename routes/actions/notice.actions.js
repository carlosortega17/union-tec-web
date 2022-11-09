const { NoticeModel, UserModel } = require('../../database/models/schemas');

const noticeList = async (req, res) => {
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
};

const noticeCreate = async (req, res) => {
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
};

module.exports = {
    noticeList,
    noticeCreate,
};