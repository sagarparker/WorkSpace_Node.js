var express           =  require("express");
var router            =  express.Router();
var passport          =  require("passport");
var User              =  require("../models/user");
var request           =  require("request");
var FreelancerDetails =  require("../models/freelancerDetails");
var ClientDetails     =  require("../models/clientDetails");
var WsTeam            =  require("../models/wsTeam");
var ProjectDetails    =  require("../models/project");
var pmClchat          =  require("../models/pmClient");
var middleware        =  require("../middleware/middleware");
var multer            =  require("multer");
var nodemailer        =  require('nodemailer');
var moment            =  require('moment');


// PROJECT MANAGER HOMEPAGE

router.get("/workspace/projectmanager",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user.id},function(err,pmData){
        ProjectDetails.find({},function(err,prjData){
            WsTeam.find({},function(err,wst){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("pmAccount/pmHome",{pmData:pmData,prjData:prjData,wst:wst});
                }
            });
        });
    });
});

// PROJECT MANAGER NOTIFICATIONS

router.get("/workspace/projectmanager/notifications",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,userData){
        FreelancerDetails.find({},function(err,allFrlData){
            ClientDetails.find({},function(err,allClData){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("pmAccount/pmNotifications",{userData:userData,allFrlData:allFrlData,allClData:allClData});
                }
            });
        });
      
    });
});

// ACCEPT CLIENT REQUEST TO WORK ON PROJECT

router.post("/workspace/notifications/acceptpmrequest/:pid/:cid",middleware.isLoggedIn,function(req,res){
    
    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{$pull:{"clientPmRequest":{clientId:""+req.params.cid}}},{safe:true,upsert:true,unique:true},function(err,frldata){
        if(err){
            console.log(err);
        }
    });


    ClientDetails.findOneAndUpdate({detailsOwner:req.params.cid},{$push:{"ClientAcceptedReq":{projectID:""+req.params.pid,pManagerID:""+req.user._id,pEvlBdg:req.body.budg}}},{safe : true, upsert : true,unique : true},function(err,cldata){
        if(err){
            console.log(err);
        }
        else{
            req.flash('success','Wait for confirmation from the client.');
            res.redirect("/workspace/projectmanager/notifications");
        }
    });
});

// EVALUATE PROJECT

router.get("/workspace/notifications/evaluate/:pid/:cid",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findById(req.params.pid,function(err,pd){
        if(err){
            console.log(err);
        }
        else{
            res.render("pmAccount/evalBudget",{pd:pd});
        }
    });
});


// DECLINE CLIENT REQUEST TO WORK ON PROJECT

router.post("/workspace/notifications/declinepmrequest/:pid/:cid",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{$pull:{"clientPmRequest":{clientId:""+req.params.cid}}},{safe:true,upsert:true,unique:true},function(err,frldata){
        if(err){
            console.log(err);
        }
        else{
            req.flash('success','Request rejected.');
            res.redirect("/workspace/projectmanager/notifications");
        }
    });
});

// PROJECT HOME PAGE 

router.get("/workspace/projectmanager/project/:pid/:pname",middleware.isLoggedIn,function(req,res){
var tDate = moment().format("Do MMM YYYY");
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,usrData){
        ProjectDetails.findById(req.params.pid,function(err,prjData){
            pmClchat.findOne({prjID:req.params.pid},function(err,pmcl){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(usrData);
                    res.render("pmAccount/pmProjectHomepage",{prjData:prjData,pid:req.params.pid,pname:req.params.pname,usrData:usrData,pmcl:pmcl,tDate:tDate});
                }
            });         
        });
    });
});

// WORKSPACE TEAM REQUEST

router.get("/workspace/pm/project/wsteamReq/:pid/:pname",middleware.isLoggedIn,function(req,res){

const teamID    = [];

const finalList = [];

    WsTeam.find({},function(err,wsTeam){
        ProjectDetails.findById(req.params.pid,function(err,pd){
            if(err){
                console.log(err);
            }
            else{
                wsTeam.forEach(function(wst){
                    teamID.push(wst.teamAdmin);
                });

                for (var i in teamID) {
                    var found = false;
                    for (var j in pd.pmTeamReq) {
                       if (teamID[i] == pd.pmTeamReq[j].teamAdmin) 
                       {
                         found = true;
                       }
                    }
                    if (found === false){
                      finalList.push(teamID[i]);
               
                } 
                }
                console.log(teamID);
                console.log(finalList);
                res.render("pmAccount/pmWsTeamReq",{wsTeam:wsTeam,pd:pd,pid:req.params.pid,pname:req.params.pname,finalList:finalList});
            }
        });
      
    });
});

router.post("/workspace/projectmanager/wsTeamReq/:pid/:pname/:teamAdmin",middleware.isLoggedIn,function(req,res){
    WsTeam.findOneAndUpdate({teamAdmin:req.params.teamAdmin},{$push:{"pmRequest":{prjID:""+req.params.pid}}},{safe : true, upsert : true,unique : true},function(err,wst){
        ProjectDetails.findByIdAndUpdate(req.params.pid,{$push:{"pmTeamReq":{teamAdmin:""+req.params.teamAdmin}}},{safe : true, upsert : true,unique : true},function(err,wst){
            if(err){
                console.log(err);
            }
            else{
                req.flash('success','Request send to ws team,please wait for response.');
                res.redirect("/workspace/pm/project/wsteamReq/"+req.params.pid+"/"+req.params.pname);
            }
        });
    });
});


router.get("/workspace/projectmanager/acptList/:pid/:pname",middleware.isLoggedIn,function(req,res){
    WsTeam.find({},function(err,wstD){
        ProjectDetails.findById(req.params.pid,function(err,prjD){
            if(err){
                console.log(err);
            }
            else{
                console.log(prjD);
                res.render("pmAccount/acceptedWsteamReq",{wstD:wstD,prjD:prjD,pid:req.params.pid,pname:req.params.pname});
            }
        });
    });
});

// SEND LIST TO THE ClIENT

router.post("/workspace/projectmanager/sendlist/:pid/:pname",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findByIdAndUpdate(req.params.pid,{acptListPM: true},function(err,pd){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/projectmanager/project/"+req.params.pid+"/"+req.params.pname);
        }
    });
});

// ASIGN TASKS

router.get("/workspace/projectmanager/assigntasks/:pid",middleware.isLoggedIn,function(req,res){
    var tDate = moment().format("Do MMM");
    FreelancerDetails.find({},function(err,frl){
        ProjectDetails.findById(req.params.pid,function(err,pdt){
            if(err){
                console.log(err);
            }
            else{
                res.render("pmAccount/pmAssignTask",{frl:frl,pdt:pdt,tDate:tDate});
            }
        });
    });
});


router.post("/workspace/projectmanager/assigntask/:pid/:frlid/:frlName",middleware.isLoggedIn,function(req,res){
    var tDate = moment().format("Do MMM YYYY");
    ProjectDetails.findByIdAndUpdate(req.params.pid,
        {$push:{"projectTasks":{
                                frlID:""+req.params.frlid,
                                frlName:""+req.params.frlName,
                                frlTask:""+req.body.prjTask,
                                tskDay:tDate,
                                tskDone:false                   
                                }}},
                                {safe : true, upsert : true,unique : true},function(err,prj){
                                                if(err){
                                                    console.log(err);
                                                }
                                                else{
                                                    res.redirect("/workspace/projectmanager/assigntasks/"+req.params.pid);
                                                }

                                });
});

// UPDATE PROJECT

router.get("/workspace/projectmanager/updateproject/:pid",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findById(req.params.pid,function(err,pd){
        if(err){
            console.log(err);
        }
        else{
            res.render("pmAccount/updateProject",{pd:pd});
        }
    });
});

router.post("/workspace/projectmanager/updateproject/spec/:pid",function(req,res){
    ProjectDetails.findByIdAndUpdate(req.params.pid,{$push:{"projSpec":{spec:""+req.body.spec}}},{safe : true, upsert : true,unique : true},function(err,pd){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/projectmanager/updateproject/"+req.params.pid);
        }
    });
});

// PROJECT PROGRESS

router.post("/workspace/projectmanager/updateproject/progress/:pid",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findByIdAndUpdate(req.params.pid,{prjProgress:req.body.prjProg},function(err,prj){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/projectmanager/updateproject/"+req.params.pid);
        }
    });
});


// PROJECT HISTORY

router.get("/workspace/projectmanager/projecthistory",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,fd){
        ProjectDetails.find({},function(err,prjData){
            if(err){
                console.log(err);
            }
            else{
                res.render("pmAccount/projectHistory",{fd:fd,prjData:prjData});
            }
        });
    });
});

// PROJECT WSTEAM HISTORY

router.get("/workspace/projectmanager/wsteamhistory",middleware.isLoggedIn,function(req,res){
    FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,fd){
        ProjectDetails.find({},function(err,prjData){
            WsTeam.find({},function(err,wst){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("pmAccount/projectTeamHistory",{fd:fd,prjData:prjData,wst:wst});
                }
            });
        });
    });
});


// PROJECT DONE

router.post("/workspace/projectmanager/done/:pid/:pname",middleware.isLoggedIn,function(req,res){
  
    ProjectDetails.findByIdAndUpdate(req.params.pid,{pActive:false},function(err,prj){
      
                if(err){
                    console.log(err);
                }
                else{
                    res.redirect("/workspace/projectmanager/project/"+req.params.pid+"/"+req.params.pname);
                }
            });
 
});

// FIND NEW PROJECTS

router.get("/workspace/projectmanager/findprojects",middleware.isLoggedIn,function(req,res){
    ProjectDetails.find({},function(err,pd){
        ClientDetails.find({},function(err,cd){
            if(err){
                console.log(err);
            }
            else{
                res.render("pmAccount/PmfindNewProject",{pd:pd,cd:cd});
            }
        });
    });
});




module.exports = router;