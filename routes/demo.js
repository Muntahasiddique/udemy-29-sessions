const { ObjectId } = require('mongodb');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../data/database');
const session = require('express-session');
const router = express.Router();

router.get('/', function (req, res) {
  res.render('welcome');
});

router.get('/signup', function (req, res) {
  let sessionInputData = req.session.inputData || {
    hasError: false,
    email: '',
    confirmemail: '',
    password: '',
  };

  req.session.inputData = null; // Clear session data after first load
  res.render('signup', { sessionInputData });
});

router.get('/login', function (req, res) {
  let sessionInputData = req.session.inputData || {
    hasError: false,
    email: '',
    password: '',
  };

  req.session.inputData = null; // Clear session data after first load
  res.render('login' ,{sessionInputData:sessionInputData} );

});

router.post('/signup', async function (req, res) {
  const data = req.body;
  const emaildata = data.email;
  const confirmemaildata = data['confirm-email'];
  const passworddata = data.password;

  if (!emaildata || !confirmemaildata || !passworddata || passworddata.trim().length < 6 || emaildata !== confirmemaildata || !emaildata.includes('@')) {
    req.session.inputData = {
      hasError: true,
      message: 'Invalid-Put',
      email: emaildata,
      confirmemail: confirmemaildata,
      password: passworddata,
    };
    req.session.save(() => res.redirect('/signup'));
    return;
  }

  const existinguser = await db.getDb().collection('users').findOne({ email: emaildata });
  if (existinguser) {
    req.session.inputData = {
      hasError: true,
      message: 'user exists',
      email: emaildata,
      confirmemail: confirmemaildata,
      password: passworddata,
    };
    req.session.save(function(){
      return res.redirect('/signup');
    })
   return;
  }

  const hashedpass = await bcrypt.hash(passworddata, 12);
  const user = { email: emaildata, password: hashedpass };
  await db.getDb().collection('users').insertOne(user);
  res.redirect('/login');
});

router.post('/login', async function (req, res) {
  const data = req.body;
  const emaildata = data.email;
  const passworddata = data.password;

  const existinguser = await db.getDb().collection('users').findOne({ email: emaildata });
  if (!existinguser) {
    req.session.inputData = {
      hasError: true,
      message: 'check again credentials',
      email: emaildata,
      password: passworddata,
    };
    req.session.save(function(){
      return res.redirect('/login');
    })
return;
  }

  const passwordequal = await bcrypt.compare(passworddata, existinguser.password);
  if (!passwordequal) {
    req.session.inputData = {
      hasError: true,
      message: 'Check again your Credentials',
      email: emaildata,
      password: passworddata,
    };
    req.session.save(function(){
      return res.redirect('/login');
    })
return;
  }

  req.session.user = { id: existinguser._id.toString(), email: existinguser.email };
  req.session.isAuthenticated = true;
  req.session.save(() => res.redirect('/profile'));
});

router.get('/admin', async function (req, res) {
  //if (!req.session.isAuthenticated) { as Locals availabe Everywhere
    if (!res.locals.isAuth) {
    return res.status(401).render('401');
  }

  //const user = await db.getDb().collection('users').findOne({ _id: new ObjectId(req.session.user.id) });

  //if (!user || !user.isAdmin) {
    if (!res.locals.isAdmin) {
    return res.status(403).render('403');
  }

  return res.render('admin'); // ✅ Fixed missing response
});

router.get('/profile', function (req, res) {
 // if (!req.session.isAuthenticated) {
    if (!res.locals.isAuth) {
    return res.status(401).render('401');
  }
  return res.render('profile'); // ✅ Fixed incorrect template
});

router.post('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
