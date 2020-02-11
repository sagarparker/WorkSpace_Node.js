var express           =  require("express");
var app               =  express();
var router            =  express.Router();
var passport          =  require("passport");
var User              =  require("../models/user");
var request           =  require("request");
var FreelancerDetails =  require("../models/freelancerDetails");
var ClientDetails     =  require("../models/clientDetails");
var WsTeam            =  require("../models/wsTeam");
var ProjectDetails    =  require("../models/project");
var middleware        =  require("../middleware/middleware");
var multer            =  require("multer");
var nodemailer        =  require('nodemailer');
var moment            =  require('moment');
var http              =  require('http');
var socketIO          =  require('socket.io');
let server            =  http.createServer(app);
let io                =  socketIO(server);








// FREELANCER HOME

router.get("/workspace/freelancer",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,fusr){
        if(fusr.FTeamID){
            WsTeam.findById(fusr.FTeamID,function(err,wsData){
                if(wsData){
                    ProjectDetails.findById(wsData.currentProjectID,function(err,prjData){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log(wsData);
                            res.render("freelancerAccount/freelancerHome",{fld:fusr,wsData:wsData,prjData:prjData});  
                        }
                    });
                }
                else{
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log(wsData);
                        res.render("freelancerAccount/freelancerHome",{fld:fusr});  
                    }
                }
              
            }); 
        }
        else{
            if(err)
            {
                console.log(err);
            }
            else{
                res.render("freelancerAccount/freelancerHome",{fld:fusr});  

            }
        }
       
    });
});

// FREELANCER ACCOUNT DETAILS

router.get("/workspace/freelancer/accountDetails",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,accDetails){
        res.render("freelancerAccount/freelancerAccDetails",{frlDet:accDetails});
    });
});

// FREELANCER TEAM DETAILS

router.get("/workspace/freelancer/teamDetails",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,frlDetails){
        var teamIDreq = frlDetails.FTeamID;
        FreelancerDetails.find({},function(err,allFrl){
            WsTeam.findById(teamIDreq,function(err,wsTeamDetails){
                res.render("freelancerAccount/freelancerTeamDetails",{frlDetails,wsTeamDetails,allFrl});
            });    
        });
    });  
});

// FREELANCER NOTIFICATIONS

router.get("/workspace/freelancer/notifications",middleware.isLoggedIn,function(req,res){

    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,frlNotf){
        FreelancerDetails.find({},function(err,frlData){
            WsTeam.findOne({teamAdmin:req.user._id},function(err,wstDet){
                ProjectDetails.find({},function(err,prjData){
                    if(err){
                        console.log(err);
                      }
                      else{
                        console.log(frlNotf);
                        console.log(wstDet);
                        res.render("freelancerAccount/freelancerNotifications",{frlNotf:frlNotf,frlData:frlData,wstDet,prjData});
                      }
                });
               
            });
        });
    });  
});

// TEAM INFO 

router.get("/workspace/freelancer/teamInfo/:id",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.find({},function(err,reqFreelancerDetl){
        WsTeam.findById(req.params.id,function(err,reqWsTeam){
          if(err){
            console.log(err);
          }
          else{
            console.log(reqWsTeam);
            res.render("freelancerAccount/reqTeamDetails",{reqFreelancerDetl:reqFreelancerDetl,reqWsTeam:reqWsTeam,joinTeamID:req.params.id});
          }
        });
    });
    
});


// ACCEPT REQUEST TO JOIN TEAM

router.post("/workspace/freelancer/acceptReq/:id",middleware.isLoggedIn,function(req,res){
    WsTeam.findByIdAndUpdate(req.params.id,{$push:{"teamMembers":{memberID:""+req.user._id}}},{safe : true, upsert : true,unique : true},function(err,acptReq){
        if(err){
        console.log(err);
        }
        else{
        console.log("Freelancer added to the new team!");
        res.redirect("/workspace/freelancer");
        }
    });


    WsTeam.findByIdAndUpdate(req.params.id,{$pull: {"frlRequest": {frlID:""+req.user._id}}},{safe : true, upsert : true, unique : true},function(err,decReq){
        if(err){
        console.log(err);
        }
        else{
        console.log("Removed from the request list from the team details.");
        }
    });

    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{$pull: {"TeamRequest": {teamID:""+req.params.id}}},{safe : true, upsert : true, unique : true},function(err,decReq){
        if(err){
        console.log(err);
        }
        else{
        console.log("Removed from the request list from the team details.");
        }
    });

    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{InATeam :true,FTeamID:req.params.id},function(err,frlTeamID){
        if(err){
        console.log(err);
        }
        else{
        console.log("Team ID added to freelancers account details.");
        }
    });

});


// DECLINE REQUEST TO JOIN TEAM

router.post("/workspace/freelancer/declReq/:id",middleware.isLoggedIn,function(req,res){
    WsTeam.findByIdAndUpdate(req.params.id,{$pull: {"frlRequest": {frlID:""+req.user._id}}},{safe : true, upsert : true, unique : true},function(err,decReq){
        if(err){
        console.log(err);
        }
        else{
        console.log("Removed from the request list from the team details.");
        }
    });

    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{$pull: {"TeamRequest": {teamID:""+req.params.id}}},{safe : true, upsert : true, unique : true},function(err,decReq){
        if(err){
        console.log(err);
        }
        else{
        console.log("Removed from the request list from the team details.");
        res.redirect("/workspace/freelancer/notifications");
        }
    });
});

// MORE INFO OF FREELANCER FOR ADMIN

router.get("/workspace/freelancer/infoJoinreq/:id/:teamId",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.params.id},function(err,frlDtl){
        if(err){
            console.log(err);
        }
        else{
            res.render("freelancerAccount/frlInfo",{frlDtl:frlDtl,frlUsrID:req.params.id,teamIDUsr:req.params.teamId});
        }
    });
});

// ACCEPT REQUEST AS A ADMIN


router.post("/workspace/acceptReqAdmin/:id/:teamId",middleware.isLoggedIn,function(req,res){
    WsTeam.findByIdAndUpdate(req.params.teamId,{$push:{"teamMembers":{memberID:""+req.params.id}}},{safe : true, upsert : true,unique : true},function(err,acptReq){
        if(err){
        console.log(err);
        }
        else{
        console.log("Freelancer added to the new team!");
        req.flash("success","New team member added to your team");
        res.redirect("/workspace/freelancer/notifications");
        }
    });


    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{$pull: {"frlJoinTeamReq": {frlJoinTeamID:""+req.params.id}}},{safe : true, upsert : true, unique : true},function(err,decReq){
        if(err){
        console.log(err);
        }
        else{
        console.log("Removed from the request list for admin.");
        }
    });

    FreelancerDetails.findOneAndUpdate({detailsOwner:req.params.id},{InATeam :true,FTeamID:req.params.teamId},function(err,frlTeamID){
        if(err){
        console.log(err);
        }
        else{
        console.log("Team ID added to freelancers account details.");
        }
    });

});

// DECLINE REQUEST AS A ADMIN

router.post("/workspace/freelancer/decJoinreq/:id/:teamId",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOneAndUpdate({detailsOwner:req.params.id},{$pull: {"frlJoinTeamReqID": {TeamID:""+req.params.teamId}}},{safe : true, upsert : true, unique : true},function(err,remTeam){
        if(err){
            console.log(err);
        }
        else{
            console.log("Removed the team id from the request list");
        }
    });

    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{$pull: {"frlJoinTeamReq": {frlJoinTeamID:""+req.params.id}}},{safe : true, upsert : true, unique : true},function(err,rem){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/freelancer/notifications");
        }
    });


});


// FREELANCER PRIVATE RESUME ROUTES

router.get("/workspace/freelancer/resume",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,userData){
        if(err){
            console.log(err);
        }
        else{
            res.render("freelancerAccount/freelancerResume",{rData:userData});
        }
    });
   
});

// FREELANCER PUBLIC RESUME ROUTES

router.get("/workspace/freelancer/resume/:id",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.params.id},function(err,userData){
        if(err){
            console.log(err);
        }
        else{
            res.render("freelancerAccount/publicfreelancerResume",{rData:userData});
        }
    });
   
});

//EDIT RESUME

router.get("/workspace/freelancer/editResume",middleware.isLoggedIn,function(req,res){
    res.render("freelancerAccount/editResume");
});

// SKILLS
router.post("/workspace/freelancer/editResume/skills",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user.id},{$push: {"skills": {newSkill:""+req.body.fskills}}},{safe : true, upsert : true, unique : true},function(err,skillData){
    if(err){
      console.log(err);
    }
    else{
      req.flash('success', req.body.fskills+' added to your skills in resume.');
      res.redirect("/workspace/freelancer/editResume");
    }
  });
  });
  
  // HOBBIES
  
  router.post("/workspace/freelancer/editResume/hobbies",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user.id},{$push: {"hobbies": {newHobbies:""+req.body.fhobbies}}},{safe : true, upsert : true, unique : true},function(err,hobbData){
    if(err){
      console.log(err);
    }
    else{
      req.flash('success', req.body.fhobbies+' added to your hobbies in resume.');
  
      res.redirect("/workspace/freelancer/editResume");
    }
  });
  });
  
  // EXPERIENCES
  
  router.post("/workspace/freelancer/editResume/experiences",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user.id},{$push: {"experience": {newExp:""+req.body.fexp}}},{safe : true, upsert : true, unique : true},function(err,expData){
    if(err){
      console.log(err);
    }
    else{
      req.flash('success', 'Experience updated in your resume.');
  
  
      res.redirect("/workspace/freelancer/editResume");
    }
  });
  });
  

// TODO list

router.get("/workspace/freelancer/todo/:id/:utype",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findById(req.params.id,function(err,uData){
        if(err){
            console.log(err);
        }
        else{
            res.render("freelancerAccount/todo",{uid:req.params.id,udata:uData,utype:req.params.utype});
        }
        
    });
});

// ADD A NEW TASK

router.post("/workspace/freelancer/todo/:id/:utype",middleware.isLoggedIn,function(req,res){
    var subdate = moment().format(' MMM Do YYYY'); 
    FreelancerDetails.findByIdAndUpdate(req.params.id,{$push:{"TodoList":{uTodo:""+req.body.msg,todoDate:subdate,taskDone:false}}},{safe : true, upsert : true,unique : true},function(err,umsg){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/freelancer/todo/"+req.params.id+"/"+req.params.utype);
        }
    });
});

// MARK TASK AS DONE

router.post("/workspace/todo/done/:id/:todoid/:utype",middleware.isLoggedIn,function(req,res){


    FreelancerDetails.updateOne( {"_id":req.params.id,TodoList:{ $elemMatch: {"_id":req.params.todoid}}}, { $set: { "TodoList.$.taskDone":true} },function(err,doneTask){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/freelancer/todo/"+req.params.id+"/"+req.params.utype);
        }
        
    });
});

// DELETE TASK

router.post("/workspace/todo/delete/:id/:todoid/:utype",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findByIdAndUpdate(req.params.id,{$pull: {"TodoList": {_id:""+req.params.todoid}}},{safe : true, upsert : true, unique : true},function(err,del){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/freelancer/todo/"+req.params.id+"/"+req.params.utype);
        }
    });
});

// ACCEPT PROJECT MANAGER REQUEST TO WORK ON PROJECT FOR TEAM ADMIN

router.post("/workspace/freelancer/acptWsReq/:tid/:pid",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findByIdAndUpdate(req.params.pid,{$push:{"acptTeamReq":{teamID:""+req.params.tid}}},{safe : true, upsert : true,unique : true},function(err,prjd){
        if(err){
            console.log(err);
        }
        else{
            
            
        }
    });

    WsTeam.findByIdAndUpdate(req.params.tid,{$pull:{"pmRequest":{prjID:""+req.params.pid}}},{safe : true, upsert : true,unique : true},function(err,prjd){
        if(err){
            console.log(err);
        }
        else{
            req.flash('success','Request accepted,please wait for response from the client');            
            res.redirect("/workspace/freelancer/notifications");
        }
    });
});

// DECLINE PROJECT MANAGER REQUEST TO WORK ON PROJECT FOR TEAM ADMIN

router.post("/workspace/freelancer/declWsReq/:tid/:pid",middleware.isLoggedIn,function(req,res){
    WsTeam.findByIdAndUpdate(req.params.tid,{$pull:{"pmRequest":{prjID:""+req.params.pid}}},{safe : true, upsert : true,unique : true},function(err,prjd){
        if(err){
            console.log(err);
        }
        else{
            req.flash('success','Request declined.');
            res.redirect("/workspace/freelancer/notifications");
        }
    });
});


// PROJECT HOME PAGE

router.get("/workspace/freelancer/project/:pid/:pname/:uid",middleware.isLoggedIn,function(req,res){
var tDate = moment().format("Do MMM YYYY");
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,usrData){
        ProjectDetails.findById(req.params.pid,function(err,prjData){
            WsTeam.findById(usrData.FTeamID,function(err,wsd){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(usrData);
                    res.render("freelancerAccount/frlProjectHomePage",{wsd:wsd,prjData:prjData,pid:req.params.pid,pname:req.params.pname,usrData:usrData,usrID:req.params.uid,tDate:tDate});
                }
            });
        });
    });
});


// MARK TODAYS TASK AS DONE

router.post("/workspace/freelancer/project/:pid/:pname/:objid",middleware.isLoggedIn,function(req,res){
    ProjectDetails.updateOne( {"_id":req.params.pid,projectTasks:{ $elemMatch: {"_id":req.params.objid}}}, { $set: { "projectTasks.$.tskDone":true} },function(err,pd){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/freelancer/project/"+req.params.pid+"/"+req.params.pname+"/"+req.user._id);
        }
    });
});


// TEAM MANAGEMENT

router.post("/workspace/freelancer/leaveTeam",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{FTeamID:"",InATeam:false},function(err,frl){
        WsTeam.findByIdAndUpdate(frl.FTeamID,{$pull:{"teamMembers":{memberID:""+req.user._id}}},{safe : true, upsert : true,unique : true},function(err,td){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/workspace/freelancer/teamSelection");
            }
        });
    });
});

// TEAM ADMIN FIND NEW PROJECT

router.get("/workspace/freelancer/findprojects",middleware.isLoggedIn,function(req,res){
    ProjectDetails.find({},function(err,pd){
        
            if(err){
                console.log(err);
            }
            else{
                res.render("freelancerAccount/FrlFindNewProj",{pd:pd});
            }
        
    });
});


router.post("/workspace/freelancer/findprojects/:pid",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,fd){
        ProjectDetails.findByIdAndUpdate(req.params.pid,{$push:{"acptTeamReq":{teamID:""+fd.FTeamID}}},{safe : true, upsert : true,unique : true},function(err,pd){
            if(err){
                console.log(err);
            }
            else{
                req.flash('success','Request sent to project manager.')
                res.redirect("/workspace/freelancer/findprojects");
            }
        });
    });
});




module.exports = router;