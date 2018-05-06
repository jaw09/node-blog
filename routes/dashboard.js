const express = require('express');
const firebaseAdmin = require('../services/firebase-admin');
const striptags = require('striptags');
const moment = require('moment');

const router = express.Router();
const categoriesRef = firebaseAdmin.ref('/categories/');
const articlesRef = firebaseAdmin.ref('/articles/');

/* GET users listing. */
router.get('/', (req, res, next) => {
  const status = req.query.status || 'public';
  let categories = {};
  categoriesRef.once('value')
    .then((snapshot) => {
      categories = snapshot.val();
      return articlesRef.orderByChild('updateTime').once('value');
    }).then((snapshot) => {
      const articles = [];
      snapshot.forEach((snapshotChild) => {
        if (status === snapshotChild.val().status) {
          articles.push(snapshotChild.val());
        }
      });
      articles.reverse();
      res.render('dashboard/index', {
        categories,
        articles,
        striptags,
        moment,
        status,
        page: 'archives'
      });
    })
});

router.get('/article/create', (req, res, next) => {
  categoriesRef.once('value')
    .then((snapshot) => {
      const categories = snapshot.val();
      res.render('dashboard/article', {
        categories
      });
    });
})

router.get('/article/:id', (req, res, next) => {
  const id = req.param('id');
  let categories = {};
  categoriesRef.once('value')
    .then((snapshot) => {
      categories = snapshot.val();
      return articlesRef.child(id).once('value');
    })
    .then((snapshot) => {
      const article = snapshot.val();
      res.render('dashboard/article', {
        categories,
        article
      });
    })
})

router.post('/article/create', (req, res, next) => {
  const data = req.body;
  const articleRef = articlesRef.push();
  const key = articleRef.key;
  const updateTime = Math.floor(Date.now() / 1000);
  data.id = key;
  data.updateTime = updateTime;
  articleRef.set(data)
    .then(() => {
      res.redirect(`/dashboard/article/${key}`);
    })
    .catch((error) => {
      console.log(error);
      alert('伺服器發生異常');
      res.redirect('/dashboard/article/create');
    })
})

router.post('/article/update/:id', (req, res, next) => {
  const data = req.body;
  const id = req.param('id');
  console.log(data);
  articlesRef.child(id).update(data)
    .then(() => {
      res.redirect(`/dashboard/article/${id}`);
    })
})

router.post('/article/delete/:id', (req, res, next) => {
  const id = req.param('id');
  console.log(id);
  articlesRef.child(id).remove();
  req.flash('notification', '文章已刪除');
  res.send('文章已刪除');
  res.end();
})

router.get('/categories', (req, res, next) => {
  const messages = req.flash('notification');
  categoriesRef.once('value')
    .then((snapshot) => {
      const categories = snapshot.val();
      res.render('dashboard/categories', {
        categories,
        messages,
        hasNotification: messages.length > 0,
        page: 'categories'
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
  categoriesRef.child(id).remove();
  req.flash('notification', '刪除標籤分類');
  res.redirect('/dashboard/categories');
})

module.exports = router;