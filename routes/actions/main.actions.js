const { PostModel, UserModel } = require('../../database/models/schemas');

const listPosts = async (req, res) => {
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
}

const createPost = async (req, res) => {
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
}

module.exports = {
    listPosts,
    createPost,
};