var mongoose    =  require("mongoose");

var chatSchema = new mongoose.Schema({
    msg     : String,
    uname   : String,
    teamID  : String,
    msgTime : String
});

module.exports = mongoose.model("pmclchat",chatSchema);
    