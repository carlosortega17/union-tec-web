const router = require('express').Router();
const { listPosts, createPost } = require('../actions/main.actions');

router.get('/', listPosts);
  
router.post('/', createPost);

module.exports = router;