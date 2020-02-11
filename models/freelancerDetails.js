var mongoose    =  require("mongoose");

var userDetailsSchema=new mongoose.Schema({
    fname            :String,
    lname            :String,
    age              :Number,
    designation      :String,
    education        :String,
    FacCdate         :String,
    Fimage           :String,
    FimageId         :String,
    FmembershipType  :String,
    detailsOwner     :String,
    FSubDuration     :String,
    FSubExpiry       :String,
    FcreditCardNo    :String,
    FcreditCardName  :String,
    FcreditCardCvv   :String,
    FSubDate         :String,
    FTeamID          :String,
    FProjectsDone    :Number,
    InATeam          :Boolean,

    //Resume details
    skills           :[{
                        newSkill:{type: String, required: true}
                      }],

    hobbies          :[{
                        newHobbies:{type: String, required: true}
                      }],
    
    experience       :[{
                        newExp:{type: String, required: true}
                      }],

    //Request send by freelancer to team admin
    frlJoinTeamReqID :[{
                        TeamID:{type: String, required:true}
                      }],

    //Request in admins notification
    frlJoinTeamReq   :[{
                        frlJoinTeamID:{type: String, required:true}
                      }],
    TeamRequest      :[{
                        teamID    : {type: String, required: true},
                        teamName  : {type: String, required: true}
                      }],

    //Todo list freelancers
    TodoList         :[{
                        todoDate  : {type: String, required: true},
                        uTodo     : {type: String, required: true},
                        taskDone  : {type: Boolean, required:true}
                      }],


    // Client request to project manager to join the team.
    clientPmRequest  :[{
                        projName  : {type: String,  required:true},
                        projID    : {type: String,  required:true},
                        clientId  : {type: String,  required:true}
                      }],


    // Project manager projects
    pmProjects       :[{
                        projectID : {type: String,  required:true},
                        projActive: {type: Boolean,  required:true}
                      }],

    // REVIEWS
    frlReviews        :[{
                        projectID   :  {type:String, required:true},
                        name        :  {type:String, required:true},
                        revTxt      :  {type:String, required:true},
                        stars       :  {type:Number, required:true}   
                      }]

});

  

    
    
module.exports = mongoose.model("freelancerDetails",userDetailsSchema);
    