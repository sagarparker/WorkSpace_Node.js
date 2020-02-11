var mongoose    =  require("mongoose");

var userDetailsSchema=new mongoose.Schema({

    Cname               :   String,
    established         :   Number,
    companyType         :   String,
    CacCdate            :   String,
    Cimage              :   String,
    CimageId            :   String,
    detailsOwner        :   String,
    CmembershipType     :   String,
    CSubDuration        :   String,
    CcreditCardNo       :   String,
    CcreditCardName     :   String,
    CcreditCardCvv      :   String,
    CSubDate            :   String,
    CSubExpiry          :   String,
    CPmRequest          :   [{
                                pmID        : {type: String, required: true},
                                projectID   : {type: String, required: true}
                            }],
    ClientAcceptedReq   :   [{
                                projectID   : {type: String, required: true},
                                pManagerID  : {type: String, required: true},
                                pEvlBdg     : {type: String, required: true}
                            }],
    ClientProjects      :   [{
                                projectID   : {type: String, required: true}
                            }],
    TodoList            :   [{
                                todoDate  : {type: String, required: true},
                                uTodo     : {type: String, required: true},
                                taskDone  : {type: Boolean, required:true}
                            }],
    clReviews           :   [{
                                projectID   :  {type:String, required:true},
                                name        :  {type:String, required:true},
                                revTxt      :  {type:String, required:true},
                                stars       :  {type:Number, required:true}   
                            }]
    });
    
module.exports = mongoose.model("clientDetails",userDetailsSchema);
    