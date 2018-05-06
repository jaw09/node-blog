const express = require('express');
const firebaseAdmin = require('../services/firebase-admin');
const firebase = require('../services/firebase-client');

const auth = firebase.auth();
const router = express.Router();


router.get('/', (req, res, next) => {
    res.render('auth/login');
});

router.post('/login', (req, res, next) => {})

router.get('/signup', (req, res, next) => {
    const error = req.flash('error');
    res.render('auth/signup', {
        error,
        hasError: error.length > 0
    });
});

router.post('/signup', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    auth.createUserWithEmailAndPassword(email, password)
        .then((user) => {
            const data = {
                'email': email,
                'uid': user.uid,
            }
            firebaseAdmin.ref(`/users/${user.uid}`).set(data);
            res.redirect('/auth');
        })
        .catch((error) => {
            console.log(error.message);
            req.flash('error', error.message);
            res.redirect('/auth/signup');
        })
});

module.exports = router;