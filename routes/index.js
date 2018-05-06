const express = require('express');
const firebaseAdmin = require('../services/firebase-admin');
const striptags = require('striptags');
const moment = require('moment');

const router = express.Router();
const categoriesRef = firebaseAdmin.ref('categories');
const articlesRef = firebaseAdmin.ref('articles');

/* GET home page. */
router.get('/', function (req, res, next) {
  let categories = {};
  categoriesRef.once('value')
    .then((snapshot) => {
      categories = snapshot.val();
      return articlesRef.orderByChild('updateTime').once('value');
    })
    .then((snapshot) => {
      const articles = [];
      snapshot.forEach((snapshotChild) => {
        if (snapshotChild.val().status === 'public') {
          articles.push(snapshotChild.val());
        }
      })
      articles.reverse();
      //分頁
      const totalResult = articles.length;
      const perPage = 10;
      const totalPage = Math.ceil(totalResult / perPage);
      let currentPage = parseInt(req.param('page')) || 1;
      if (currentPage > totalPage) {
        currentPage = totalPage;
      }
      let minItem = (currentPage - 1) * perPage + 1;
      let maxItem = currentPage * perPage;
      const data = [];
      articles.forEach((article, i) => {
        let item = i + 1;
        if (item >= minItem && item <= maxItem) {
          console.log(article)
          data.push(article);
        }
      })
      const page = {
        totalPage,
        currentPage,
        hasPre: currentPage === 1,
        hasNext: currentPage === totalPage
      }
      console.log(page.currentPage);
      res.render('index', {
        categories,
        articles: data,
        striptags,
        moment,
        page
      });
    })
});

router.get('/post/:id', function (req, res, next) {
  const id = req.param('id');
  let categories = {};
  categoriesRef.once('value')
    .then((snapshot) => {
      categories = snapshot.val();
      return articlesRef.child(id).once('value');
    })
    .then((snapshot) => {
      const article = snapshot.val();
      res.render('post', {
        categories,
        article,
        moment
      });
    })
});

module.exports = router;