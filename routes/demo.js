const express = require('express');
const bcrypt = require('bcryptjs')
const db = require('../data/database');
const router = express.Router();

router.get('/', function (req, res) {
  res.render('welcome');
});

router.get('/signup', function (req, res) {
  res.render('signup');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/signup', async function (req, res) {
 const data = req.body;
 const emaildata =data.email;
 const confirmemaildata = data['confirm-email'];
 const passworddata = data.password;
 const hashedpass = await bcrypt.hash(passworddata , 12);
 const user = {
  email : emaildata,
  password : hashedpass
 }
 await db.getDb().collection('users').insertOne(user);
 res.redirect('/login');
});

router.post('/login', async function (req, res) {});

router.get('/admin', function (req, res) {
  res.render('admin');
});

router.post('/logout', function (req, res) {});

module.exports = router;
