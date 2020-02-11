var mongoose    =  require("mongoose");

var chatSchema = new mongoose.Schema({
    prjID   :   String,
    pmcl    :   [{
                    usrID   :   {type:String, require:true},
                    prjID   :   {type:String, require:true}
                }]
});

module.exports = mongoose.model("pmcl",chatSchema);
    