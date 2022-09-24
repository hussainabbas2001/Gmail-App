var express = require('express');
const { Passport } = require('passport');
var router = express.Router();
var passport = require("passport");
var localStrategy = require("passport-local");
var UserModel = require("./users");
var mailModel = require("./mail")
var multer = require("multer")
passport.use(new localStrategy(UserModel.authenticate()))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const fn = Date.now() + Math.floor(Math.random()*10000)+file.originalname
    cb(null, fn)
  }
})
const upload = multer({ storage: storage })



router.get('/', function(req, res, next) {
  res.render('index');
});

router.post("/register", function(req, res){
  const newUser = new UserModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    mobile: req.body.mobile
  })
  UserModel.register(newUser, req.body.password)
  .then(function(reg){
    passport.authenticate('local')(req, res, function(){
      res.redirect("/profile")
    })
  })
  .catch(function(err){
    res.send(err)
  })
})

router.post("/login",passport.authenticate('local',{
  successRedirect: "/profile",
  failureRedirect: "/login"
}) , function(req, res){})

router.get('/login', function(req, res, next) {
  res.render('login');
});
router.get('/profile', isLoggedIn , async function(req, res, next) {
  var loggedInUser =  await UserModel.findOne({username: req.session.passport.user})

  .populate({
    path : 'receivedMails',
    populate : {
      path : 'sender'
    }
  })
  res.render("profile",{Users: loggedInUser})
});

router.get("/logout", function(req, res){
  req.logOut((err)=>{
    if(err)throw err;
    res.redirect("/login")
  })
})


// router.post("/compose", isLoggedIn, function(req, res){
//   UserModel.findOne({username: req.session.passport.user})
//   .then(function(loggedInUser){
//     mailModel.create({
//       sender: loggedInUser._id,
//       reciever: req.body.reciever,
//       mailtext: req.body.mailtext
//     })
//     .then((createdMail)=>{
//       var createdMailId = createdMail._id
//       loggedInUser.Sentmails.push(createdMailId)
//       loggedInUser.save()
//     })
//     var createdMailId;
//     UserModel.findOne({
//       email: req.body.reciever
//     })
//     .then((foundReceverUser)=>{
//       console.log(foundReceverUser)
//       var createdMailId;
//       foundReceverUser.receivedMails.push(createdMailId)
//       foundReceverUser.save()
//     })
//     .then(()=>{
//       res.redirect("/profile")
//     })
//   })
// })



router.post("/compose", isLoggedIn,  async function(req, res){
   const loggedInUser =  await UserModel.findOne({username: req.session.passport.user})
   const createdMail =   await mailModel.create({
    sender: loggedInUser._id,
    reciever: req.body.reciever,
    mailtext: req.body.mailtext
  })
  loggedInUser.Sentmails.push(createdMail._id)
  const loggedInUserUpdated =  await loggedInUser.save()

  const recieverUser = await UserModel.findOne({email: req.body.reciever})
  recieverUser.receivedMails.push(createdMail._id)
  const recieverUserUpdated = await recieverUser.save()
  res.redirect("/profile")
})

router.get("/sent", isLoggedIn,async function(req, res){
  var loggedInUser =  await UserModel.findOne({username: req.session.passport.user})
  .populate("Sentmails")
  res.render("mails",{user: loggedInUser})
})

router.post("/fileupload",isLoggedIn,upload.single("image") , async function(req,res){
  const founduser = await UserModel.findOne({username:req.session.passport.user})

  founduser.image = req.file.filename
  await founduser.save()
 res.redirect("/profile")
})

function fileFilter (req, file, cb) {
  if(file.mimetype === 'image/jpeg'|| file.mimetype === 'image/jpg'||file.mimetype === 'image/png')
  cb(null,  true);
  else{
    cb(new Error('tez mat chal'))
  }
}

router.get("/delete/:id", function(req,res){
  mailModel.findOneAndDelete({
    _id: req.params.id
  })
  .then(()=>{
    res.redirect("/profile")
  })
})


router.get("/check/:username", async function(req, res){
 var Userfound = await UserModel.findOne({username: req.params.username})
//  res.render("index", {Userfound})
res.json({ "index": Userfound});
})

router.get("/findall", function(req, res){
  UserModel.deleteMany()
  .then(function(found){
    res.send(found)
  })
})


router.get("/findmails", function(req, res){
  mailModel.deleteMany()
  .then(function(find){
    res.send(find)
  })
})

function isLoggedIn (req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  else{
    res.redirect("/")
  }
}
module.exports = router;