const router = require('express').Router();
const { noticeList, noticeCreate } = require('../actions/notice.actions');

router.get('/notice', noticeList);

router.post('/notice', noticeCreate);

module.exports = router;