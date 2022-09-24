const mongoose = require("mongoose");

const mailSchema =  mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    reciever: String,
    mailtext: String
})

module.exports =  mongoose.model("mail", mailSchema )