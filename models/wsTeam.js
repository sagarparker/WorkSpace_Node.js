var mongoose    =   require('mongoose');


var wsTeamSchema=new mongoose.Schema({

    teamAdmin           :   String,
    teamName            :   String,
    teamDescription     :   String,
    teamCategory        :   String,
    teamCreationDate    :   String,
    teamProjectsDone    :   String,
    teamRating          :   String,
    currentProjectID    :   String,
    projLive            :   Boolean,
    teamMembers         :  [{
                              memberID: {type:String, require: true}
                           }],
    frlRequest          :  [{
                             frlID    : {type: String, required: true}
                           }],
    pmRequest           :  [{
                              prjID   : {type: String, required: true}
                           }],
    projectList         :  [{
                              prjID   : {type:String, require: true}
                           }],
   wsTeamReviews        :  [{
                              projectID   :  {type:String, required:true},
                              name        :  {type:String, required:true},
                              revTxt      :  {type:String, required:true},
                              stars       :  {type:Number, required:true}   
                          }]
  });
  


    
module.exports = mongoose.model("wsTeamDetails",wsTeamSchema);