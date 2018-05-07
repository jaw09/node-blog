const express = require('express');
const firebaseAdmin = require('../services/firebase-admin');
const striptags = require('striptags');
const moment = require('moment');
const convertPagination = require('../modules/convertPagination')

const router = express.Router();
const categoriesRef = firebaseAdmin.ref('categories');
const articlesRef = firebaseAdmin.ref('articles');

/* GET home page. */
router.get('/', function (req, res, next) {
  let categories = {};
  let currentPage = parseInt(req.param('page')) || 1;
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
      const {
        page,
        data
      } = convertPagination(articles, currentPage);
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
      if (!article) {
        return res.render('error', {
          title: '找不到該文章 :('
        })
      }
      res.render('post', {
        categories,
        article,
        moment
      });
    })
});

module.exports = router;