var mongoose    =  require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema=new  mongoose.Schema({
email                   :   String,
wsuser                  :   String,
username                :   String,
password                :   String,
Cmembership             :   String,
Fmembership             :   String,
resetPasswordToken      :   String
});

userSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User",userSchema);