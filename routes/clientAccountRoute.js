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
var CProject          =  require("../models/project");
var pmClChat          =  require("../models/pmClient");
var middleware        =  require("../middleware/middleware");
var multer            =  require("multer");
var nodemailer        =  require('nodemailer');
var moment            =  require('moment');


// CLIENT HOME PAGE

router.get("/workspace/client",middleware.isLoggedIn,function(req,res){
    ClientDetails.findOne({detailsOwner:req.user._id},function(err,cld){
        ProjectDetails.find({},function(err,prjData){
            WsTeam.find({},function(err,wst){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("clientAccount/clientHome",{cld:cld,prjData:prjData,wst:wst});
                }
            });
    
        });
      
    });
    
});

// CLIENT ACCOUNT DETAILS

router.get("/workspace/client/accDetails",middleware.isLoggedIn,function(req,res){
    ClientDetails.findOne({detailsOwner:req.user._id},function(err,accDet){
        if(err){
            console.log(err);
        }
        else{
            res.render("clientAccount/clientDetails",{cad:accDet});
        }
    });
});


// NEW PROJECT

router.get("/workspace/client/newproject",middleware.isLoggedIn,function(req,res){
    res.render("clientAccount/newproject")
});

router.post("/workspace/client/newproject",middleware.isLoggedIn,function(req,res){
    const pname = req.body.pname;
    const ptype = req.body.ptype;
    const pdesc = req.body.pdesc;
    const pdate = moment().format('MMMM Do YYYY');
    const clID  = req.user._id;
    

    const projectData = {
                        pName           :   pname,
                        pType           :   ptype,
                        pCreationDate   :   pdate, 
                        pDescription    :   pdesc,
                        pClientID       :   clID,
                        pActive         :   true,
                        assignedPM      :   false,
                        assignedWsTeam  :   false,
                        acptListPM      :   false,
                        prjPayment      :   false,
                        prjProgress     :   0
                        }


   

    CProject.create(projectData,function(err,pData){
        pmClChat.create({prjID:pData._id},function(err,pmcl){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/workspace/client/"+pData._id+"/projbudget");
            }
        });
    });
});

// PROJECT BUDGET

router.get("/workspace/client/:id/projbudget",middleware.isLoggedIn,function(req,res){
    res.render("clientAccount/projbudget",{urlID:req.params.id});
});


router.post("/workspace/client/:id/projbudget",middleware.isLoggedIn,function(req,res){
    const durat  = req.body.pdur;
    const budget = req.body.pbudg; 
    const crit   = req.body.budgetCriteria;
    const deadl  = req.body.pdeadline; 

    const bData = {
                    pDeadline       :   deadl,
                    pBudgetCriteria :   crit,
                    pBudget         :   budget,
                    pDuration       :   durat
                  }

    ClientDetails.findOneAndUpdate({detailsOwner:req.user._id},{$push: {ClientProjects :{projectID:""+req.params.id}}},{safe : true, upsert : true,unique : true},function(err,clProj){
        if(err){
            console.log(err);
        }
    });

    pmClChat.findOneAndUpdate({prjID:req.params.id},{$push: {pmcl :{usrID:""+req.user._id,prjID:req.params.id}}},{safe : true, upsert : true,unique : true},function(err,pmcl){
        if(err){
            console.log(err);
        }
    });

    CProject.findByIdAndUpdate(req.params.id,bData,function(err,pData){
        if(err){
            console.log(err);
        }
        else{
            // res.redirect("/workspace/client/pmrequest/"+pData.pName+"/"+pData._id);
            res.redirect("/workspace/client/specification/"+pData.pName+"/"+pData._id+"/newProject");
        }
    });

    
});

// PROJECT SPECIFICATION

router.get("/workspace/client/specification/:pname/:pid/:projStat",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findById(req.params.pid,function(err,pData){
        if(err){
            console.log(err);
        }
        else{
            res.render("clientAccount/projSpec",{pData:pData,projStat:req.params.projStat});
        }
    });
});

router.post("/workspace/client/specification/:pname/:pid/:projStat",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findByIdAndUpdate(req.params.pid,{$push: {projSpec :{spec:""+req.body.specFld}}},{safe : true, upsert : true,unique : true},function(err,prj){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/client/specification/"+req.params.pname+"/"+req.params.pid+"/"+req.params.projStat);
        }
    });
});

// CLIENT PROJECT MANAGER REQUEST

router.get("/workspace/client/pmrequest/:pname/:pid",middleware.isLoggedIn,function(req,res){

const clpmReq       = [];

const clpmReqFinal  = [];

    FreelancerDetails.find({designation:"Project manager"},function(err,pmData){
        ClientDetails.findOne({detailsOwner:req.user._id},function(err,clData){
            if(err){
                console.log(err);
            }
            else{

                pmData.forEach(function(pData){ 
                    clpmReq.push(pData.detailsOwner);
                });

                for (var i in clpmReq) {
                    var found = false;
                    for (var j in clData.CPmRequest) {
                       if (clpmReq[i] == clData.CPmRequest[j].pmID) 
                       {
                         found = true;
                        
                       }
                    }
                    if (found === false){
                      clpmReqFinal.push(clpmReq[i]);
               
                } 
                }

                
                res.render("clientAccount/cPmRequest",{pmData:pmData,clData:clData,finalList:clpmReqFinal,pname:req.params.pname,pid:req.params.pid});
            }
        });
      
    });
});

// SENDING REQUEST TO PROJECT MANAGERS

router.post("/workspace/client/pmrequest/:id/:pname/:pid",middleware.isLoggedIn,function(req,res){
    ClientDetails.findOneAndUpdate({detailsOwner:req.user._id},{$push: {CPmRequest :{pmID:""+req.params.id,projectID:""+req.params.pid}}},{safe : true, upsert : true,unique : true},function(err,frlinfo){
        if(err){
            console.log(err);
        }
    });

    FreelancerDetails.findOneAndUpdate({detailsOwner:req.params.id},{$push: {clientPmRequest :{clientId:""+req.user._id,projName:""+req.params.pname,projID:""+req.params.pid}}},{safe : true, upsert : true,unique : true},function(err,frlinfo){
        if(err){
            console.log(err);
        }
        else{
            req.flash('success', ' Request sent to '+frlinfo.fname+',please wait for response.');
            res.redirect("/workspace/client/pmrequest/"+req.params.pname+"/"+req.params.pid);
        }
    });


});

// CLIENT NOTIFICATIONS

router.get("/workspace/client/notifications",middleware.isLoggedIn,function(req,res){

const allData   = {};

    ClientDetails.findOne({detailsOwner:req.user._id},function(err,userData){
        FreelancerDetails.find({},function(err,allFrlData){
            ProjectDetails.find({},function(err,pd){

                if(err){
                    console.log(err);
                }
                else{
                    userData.ClientAcceptedReq.forEach(function(ud){
                        allData[ud.pManagerID] = ud.projectID;
                    });

                    
                    
                    res.render("clientAccount/clientNotf",{userData:userData,allFrlData:allFrlData,allPD:pd,allData: allData});
                }

            });
           
                
        });
      
    });
});

// SELECTING PROJECT MANAGER

router.post("/workspace/client/makeprojectmanager/:pmid/:prjid/:pbudget",middleware.isLoggedIn,function(req,res){
    
    ProjectDetails.findByIdAndUpdate(req.params.prjid,{pManager:req.params.pmid,assignedPM:true,pBudget:req.params.pbudget},function(err,pdata){
        if(err){
            console.log(err);
        }
    });

    ProjectDetails.findByIdAndUpdate(req.params.prjid,{$push:{memberList :{usrID:""+req.params.pmid}}},{upsert:true,safe:true,unique:true},function(err,pm){
        if(err){
            console.log(err);
        }
    });

    pmClChat.findOneAndUpdate({prjID:req.params.prjid},{$push: {pmcl :{usrID:""+req.params.pmid,prjID:req.params.prjid}}},{safe : true, upsert : true,unique : true},function(err,pmcl){
        if(err){
            console.log(err);
        }
    });




    FreelancerDetails.findOneAndUpdate({detailsOwner:req.params.pmid},{$push:{pmProjects :{projectID:""+req.params.prjid}}},{upsert:true,safe:true,unique:true},function(err,frldata){
        if(err){
            console.log(err);
        }
    });

    ClientDetails.findOneAndUpdate({detailsOwner:req.user._id},{$pull:{ClientAcceptedReq:{pManagerID:""+req.params.pmid}}},{upsert:true,safe:true,unique:true},function(err,rmData){
        if(err){
            console.log(err);
        }
        else{
            req.flash('success','Project manager added to your project');
            res.redirect("/workspace/client/notifications");
        }
    });



});

// PROJECT HOME PAGE

router.get("/workspace/client/project/:pid/:pname",middleware.isLoggedIn,function(req,res){
var tDate = moment().format("Do MMM YYYY");
    ClientDetails.findOne({detailsOwner:req.user._id},function(err,clData){
        ProjectDetails.findById(req.params.pid,function(err,prjData){
            pmClChat.findOne({prjID:req.params.pid},function(err,pmcl){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("clientAccount/clientProjectHomepage",{prjData:prjData,pid:req.params.pid,pname:req.params.pname,pmcl:pmcl,clData:clData,tDate:tDate});
                }
            });
        });
    });
});

// WsTeam list

router.get("/workspace/client/wsTeamList/:pid/:pname",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findById(req.params.pid,function(err,prjD){
        WsTeam.find({},function(err,wst){
            if(err){
                console.log(err);
            }
            else{
                res.render("clientAccount/wsTeamList",{wst:wst,prjD:prjD,pid:req.params.pid,pname:req.params.pname});
            }
        });
    });
});

router.post("/workspace/client/selectTeam/:wsid/:pid/:pmid/:pname",middleware.isLoggedIn,function(req,res){
    
    WsTeam.findById(req.params.wsid,function(err,ws){
        ws.teamMembers.forEach(function(wsd){
            ProjectDetails.findByIdAndUpdate(req.params.pid,{$push:{memberList:{usrID:""+wsd.memberID}}},{upsert:true,safe:true,unique:true},function(err,fl){
                if(err){
                    console.log(err);
                }
            });
        });  
    });

    

    WsTeam.findByIdAndUpdate(req.params.wsid,{$push:{projectList:{prjID:""+req.params.pid}},projLive: true,currentProjectID:req.params.pid},{upsert:true,safe:true,unique:true},function(err,fl){
        if(err){
            console.log(err);
        }
    });

    ProjectDetails.findByIdAndUpdate(req.params.pid,{pTeam:req.params.wsid},function(err,done){
        if(err){
            console.log(err);
        }
    });

    ProjectDetails.findByIdAndUpdate(req.params.pid,{assignedWsTeam: true},function(err,prj){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/client/project/"+req.params.pid+"/"+req.params.pname);
        }
    });


    

});

// TODO LIST

router.get("/workspace/client/todo/:id",middleware.isLoggedIn,function(req,res){
    ClientDetails.findById(req.params.id,function(err,uData){
        if(err){
            console.log(err);
        }
        else{
            res.render("clientAccount/clToDo",{uid:req.params.id,udata:uData});
        }
        
    });
});

// ADD A NEW TASK

router.post("/workspace/client/todo/:id",middleware.isLoggedIn,function(req,res){
    var subdate = moment().format(' MMM Do YYYY'); 
    ClientDetails.findByIdAndUpdate(req.params.id,{$push:{"TodoList":{uTodo:""+req.body.msg,todoDate:subdate,taskDone:false}}},{safe : true, upsert : true,unique : true},function(err,umsg){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/client/todo/"+req.params.id);
        }
    });
});

// MARK TASK AS DONE

router.post("/workspace/client/todo/done/:id/:todoid",middleware.isLoggedIn,function(req,res){


    ClientDetails.updateOne( {"_id":req.params.id,TodoList:{ $elemMatch: {"_id":req.params.todoid}}}, { $set: { "TodoList.$.taskDone":true} },function(err,doneTask){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/client/todo/"+req.params.id);
        }
        
    });
});

// DELETE TASK

router.post("/workspace/client/todo/delete/:id/:todoid",middleware.isLoggedIn,function(req,res){
    ClientDetails.findByIdAndUpdate(req.params.id,{$pull: {"TodoList": {_id:""+req.params.todoid}}},{safe : true, upsert : true, unique : true},function(err,del){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/client/todo/"+req.params.id);
        }
    });
});


// PROJECT PAYMENT

router.get("/workspace/client/prjPayment/:pid",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findById(req.params.pid,function(err,prjData){
        if(err){
            console.log(err);
        }
        else{
            res.render("clientAccount/clPrjPayment",{prjData:prjData});
        }
    });
});

router.post('/workspace/client/prjPayment/:pid',middleware.isLoggedIn,function(req,res){
var ceid;
    ProjectDetails.findByIdAndUpdate(req.params.pid,{prjPayment:true},function(err,prj){
        User.findById(prj.pClientID,function(err,cd){
            if(err){
                console.log(err);
            }
            else{
                
                ceid = cd.email;
                console.log(ceid);
                
        ////////// SENDIND EMAIL TO THE USER WITH SUBSCRIPTION DETAILS

        const output = `
        <div style="width:60%">
        <h1 style="color:blue"><b>WorkSpace.com</b></h1>
        <hr>
        <h3>${ prj.pName } project payment successful</h3>
        <h3>Final project payment : $${ prj.pBudget } </h3>
        <p>The payment you make will only be transferred to the WsTeam once the project is complete,incase of some complication related to your project the money will be transfered back to you after 
        further analysis by our team at WorkSpace.com *.  <span style="color:gray;font-size: 0.6em;">(T&C applied)</span>
        </p>
        </div>
      

    
      `;
    
     
      let transporter = nodemailer.createTransport({
        service:'gmail',
        secure: false, 
        auth: {
            user: 'workspacews8@gmail.com',
            pass: 'workspace123'  
        },
        tls:{
          rejectUnauthorized:false
        }
      });
    
      
      let mailOptions = {
          from: 'workspacews8@gmail.com', 
          to: ceid, 
          subject: 'Workspace.com - Project payment', 
          text: 'Hello world?', 
          html: output 
      };
    
      
      transporter.sendMail(mailOptions, (error, info) => {
        
          if (error) {
              return console.log(error);
          }
          else{
            console.log('Message sent: %s', info.messageId);   
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            res.redirect("/workspace/client/project/"+prj._id+"/"+prj.pName);
            }
            
            });
            }
        });
    });
});

// PROJECT HISTORY

router.get("/workspace/client/projecthistory",middleware.isLoggedIn,function(req,res){
    ClientDetails.findOne({detailsOwner:req.user._id},function(err,cd){
        ProjectDetails.find({},function(err,prjData){
            if(err){
                console.log(err);
            }
            else{
                res.render("clientAccount/projectHistory",{cd:cd,prjData:prjData});
            }
        });
    });
});



// PROJECT WSTEAM HISTORY

router.get("/workspace/client/wsteamhistory",middleware.isLoggedIn,function(req,res){
    ClientDetails.findOne({detailsOwner:req.user._id},function(err,cd){
        ProjectDetails.find({},function(err,prjData){
            WsTeam.find({},function(err,wst){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("clientAccount/projectTeamHistory",{cd:cd,prjData:prjData,wst:wst});
                }
            });
        });
    });
});

// PROJECT SPECIFICATION

router.get("/workspace/client/prjSpecification/:pid",middleware.isLoggedIn,function(req,res){
    ProjectDetails.findById(req.params.pid,function(err,pd){
        if(err){
            console.log(err);
        }
        else{
            res.render("clientAccount/prjSpec",{pd:pd});
        }
    });
});







module.exports = router;