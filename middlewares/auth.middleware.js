exports.authMiddleware = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  return res.redirect('/');
};

exports.noAuthMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  return res.redirect('/panel');
};
