const express = require('express');
const firebaseAdmin = require('../services/firebase-admin');
const firebase = require('../services/firebase-client');

const auth = firebase.auth();
const router = express.Router();


router.get('/', (req, res, next) => {
    const error = req.flash('error');
    const logout = req.flash('logout');
    res.render('auth/login', {
        error,
        hasError: error.length > 0,
        logout,
        hasLogout: logout.length > 0,
    });
});

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    auth.signInWithEmailAndPassword(email, password)
        .then((user) => {
            req.session.uid = user.uid;
            req.session.mail = req.body.email;
            res.redirect('/dashboard');
        })
        .catch((error) => {
            req.flash('error', error.message);
            res.redirect('/auth');
        })
})

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

router.get('/signout', (req, res, next) => {
    req.session.uid = '';
    req.flash('logout', 'Logout successfully!');
    res.redirect('/auth')
});


module.exports = router;