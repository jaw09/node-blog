var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('dashboard/index');
});

router.get('/article', function (req, res, next) {
  res.render('dashboard/article');
});

router.get('/signup', function (req, res, next) {
  res.render('dashboard/signup');
});

router.get('/categories', function (req, res, next) {
  res.render('dashboard/categories');
});

module.exports = router;