const path = require('path');

const express = require('express');
const session = require('express-session')
const mongodbStore = require('connect-mongodb-session')
const MongodbStore = mongodbStore(session);
const sessionstore = new MongodbStore({
  uri:'mongodb+srv://muntahamirza890:dbMuntahaPass@mydb.bcxy0.mongodb.net/',
  databaseName : 'auth-demo',
  collection:'sessions'
})
const db = require('./data/database');
const demoRoutes = require('./routes/demo');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'super-secrete',
  resave:false,
  saveUninitialized: false,
  store:sessionstore
}));

app.use(demoRoutes);

app.use(function(error, req, res, next) {
  res.render('500');
})

db.connectToDatabase().then(function () {
  app.listen(3000);
});
