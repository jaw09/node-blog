const express = require('express');
const firebaseAdmin = require('../services/firebase-admin');

const router = express.Router();
const categoriesRef = firebaseAdmin.ref('/categories/');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('dashboard/index');
});

router.get('/article', function (req, res, next) {
  res.render('dashboard/article');
});

router.get('/categories', function (req, res, next) {
  const messages = req.flash('notification');
  categoriesRef.once('value')
    .then((snapshot) => {
      const categories = snapshot.val();
      res.render('dashboard/categories', {
        categories,
        messages,
        hasNotification: messages.length > 0
      });
    })
});

router.post('/categories/create', (req, res, next) => {
  const data = req.body;
  const categoryRef = categoriesRef.push();
  const key = categoryRef.key;
  data.id = key;
  categoriesRef.orderByChild('path').equalTo(data.path).once('value')
    .then((snapshot) => {
      if (snapshot.val()) {
        req.flash('notification', '已有相同路徑')
        res.redirect('/dashboard/categories');
      } else {
        categoryRef.set(data)
          .then(() => {
            res.redirect('/dashboard/categories');
          })
      }
    });
})

router.post('/categories/delete/:id', (req, res, next) => {
  const id = req.param('id');
  console.log(id);
  categoriesRef.child(id).remove();
  req.flash('notification', '刪除標籤分類');
  res.redirect('/dashboard/categories');
})

router.get('/signup', function (req, res, next) {
  res.render('dashboard/signup');
});

module.exports = router;