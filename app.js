require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
//Importar los paquetes instalados para password
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;


//importar modelo
const User = require('./models/User.model')

//Configuración DB
mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.la1hq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });


//-----EXPRESS---
const app = express();

// Middleware Setup
app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//Configurar session
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
}))

//configurar la serializacion 
passport.serializeUser((user,callback)=>{
  callback(null, user._id)
})
passport.deserializeUser((id,callback)=>{
  User.findById(id)
  .then((result) => {
    callback(null, result)
  })
  .catch((err) => {
    callback(err)
  });
})

//configurar el middelware de flash
app.use(flash())

//Configurar Strategy (despúes de flash)
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, (req, username, password, next )=>{
  User.findOne({username})
  .then((user) => {
    if(!user){ //Si el ususario no existe 
      return next(null, false, {message: 'Incorrect Username'});
    }

    if(!bcrypt.compareSync(password, user.password)){
      return next(null, false, {message: 'Incorrect Password'});
    }

    return next(null, user)
  })
  .catch((err) => {
    next(err);
  });
}));

//Configurar middelware de passport (siempre después de configurar Strategy)
app.use(passport.initialize())
app.use(passport.session())

// Express View engine setup   
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


//----ROUTES
app.use('/',require('./routes/index.routes'));
app.use('/', require('./routes/auth.routes'));
app.use('/sports', require('./routes/sport.routes'))


app.listen(process.env.PORT, ()=>{
  console.log('conectado en el puerto 3000')
})
