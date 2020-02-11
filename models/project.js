var mongoose    =  require("mongoose");

var userDetailsSchema=new mongoose.Schema({

    pName           :   String,
    pClientID       :   String,
    pType           :   String,
    pCreationDate   :   String,
    pStartDate      :   String,
    pDeadline       :   String,
    pDescription    :   String,
    pBudgetCriteria :   String,
    pBudget         :   String,
    pDuration       :   String,
    pManager        :   String,
    pTeam           :   String,
    pReview         :   String,
    pCReview        :   String,
    pActive         :   Boolean,
    assignedPM      :   Boolean,
    assignedWsTeam  :   Boolean,
    acptListPM      :   Boolean,
    prjPayment      :   Boolean,
    prjProgress     :   Number,
    pmTeamReq       :   [{
                            teamAdmin :{type:String, required: true}
                        }],
    projSpec        :   [{
                            spec:{type:String, required:true}
                        }],
    acptTeamReq     :   [{
                            teamID    :{type:String, required: true}
                        }],
    memberList      :   [{
                            usrID     :{type:String, required: true}
                        }],
    projectTasks    :   [{
                            frlID     :{type:String, required:true},
                            frlName   :{type:String, required:true},
                            frlTask   :{type:String, required:true},
                            tskDay    :{type:String, required:true},
                            tskDone    :{type:Boolean, required:true}
                        }],

    PrjReviews       :   [{
                            projectID   :  {type:String, required:true},
                            name        :  {type:String, required:true},
                            revTxt      :  {type:String, required:true},
                            stars       :  {type:Number, required:true}   
                        }]

    });
    
module.exports = mongoose.model("project",userDetailsSchema);