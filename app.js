const path = require('path');

const express = require('express');
const session = require('express-session')
const { ObjectId } = require('mongodb');  // ✅ Add this line
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
// app.use(async function(req , res , next ){
//   const user = req.session.user;
//   const isAuth = req.session.isAuthenticated;

//   if(!user || !isAuth){
// return next();
//   }
// const userDoc=  await db.getDb().collection('users').findOne({
//     _id : user.id
//   })
//   const isAdmin = userDoc.isAdmin; 
//   res.locals.isAuth =   isAuth;
//   res.locals.isAdmin = isAdmin
// next();
// })
app.use(async function(req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next(); // Skip middleware if no user is authenticated
  }

  try {
    // ✅ Convert `user.id` to MongoDB ObjectId to ensure correct format
    const userDoc = await db.getDb().collection('users').findOne({
      _id: new ObjectId(user.id)
    });

    if (!userDoc) {
      console.log("User not found in database"); // Debugging message
      return next(); // Exit middleware if user is not found
    }

    res.locals.isAuth = isAuth;
    res.locals.isAdmin = userDoc.isAdmin || false; // ✅ Prevent undefined errors

    next();
  } catch (error) {
    console.error("Database error:", error);
    next(); // Move to the next middleware
  }
});

app.use(demoRoutes);

app.use(function(error, req, res, next) {
  res.render('500');
})

db.connectToDatabase().then(function () {
  app.listen(3000);
});
