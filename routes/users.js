var mongoose = require("mongoose");
var plm = require("passport-local-mongoose")
mongoose.connect("mongodb://localhost/gmailapp");

var UserSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  mobile: String,
  image: [{
    type: String,
    default: "def.jpg"
  }],
  Sentmails:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "mail"
  }],
  receivedMails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "mail"
  }]
})



UserSchema.plugin(plm)

 module.exports = mongoose.model("user", UserSchema)