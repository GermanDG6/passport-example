const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport')

const User = require('../models/User.model');


/* GET home page */
router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req,res,next)=>{
  const {username, password} = req.body
  //Comprobar que username y password no esten vacios 
  if(username === '' || password === ''){
    res.render('signup',{ errorMessage: 'Tienes que rellenar todos los campos'})
  }
  User.findOne({username})
  .then((user) => {
    //Verificar que el usuario ya existe
    if(user){
      res.render('signup', {errorMessage: 'Este usuario ya existe'})
    }else{
      const hashedPassword = bcrypt.hashSync(password, 10)
      User.create({username: username, password: hashedPassword})
      .then((result) => {
        res.redirect('/login')
      })
    }
  }).catch((err) => {
    
  });


})

router.get('/login', (req,res,next)=>{
  res.render('login', {errorMessage: req.flash('error')})
})
router.post('/login', passport.authenticate('local',{
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))


router.get('/logout', (req,res)=>{
  req.logout()
  res.redirect('/')
})


module.exports = router;