const express = require('express');
const router = express.Router();

const Sport = require('../models/Sport.model');
const User = require('../models/User.model');


//Middleware de checkForAuth
const checkForAuth = (req,res,next) => {
  if(req.isAuthenticated()){
    return next()
  }else{
    res.redirect('/login')
  }
}

router.get('/new', checkForAuth, (req,res,next)=>{
  res.render('sports/newSport')
})

router.post('/new', (req,res)=>{
//req.user Te da acceso al usuario que tenga la sesion iniciada.
  console.log(req.body)
  Sport.create(req.body)
  .then((result) => {
    console.log(result)
    User.findByIdAndUpdate(req.user._id, {$push: {sports: result._id}})
    .then(() => {
      res.redirect('/profile')
    })
  })
  .catch((err) => {
    res.send(err)
  });
})




module.exports = router;