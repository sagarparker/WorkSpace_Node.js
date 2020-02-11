var express           =  require("express");
var router            =  express.Router();
var passport          =  require("passport");
var User              =  require("../models/user");
var request           =  require("request");
var FreelancerDetails =  require("../models/freelancerDetails");
var ClientDetails     =  require("../models/clientDetails");
var WsTeam            =  require("../models/wsTeam");
var middleware        =  require("../middleware/middleware");
var multer            =  require("multer");
var nodemailer        =  require('nodemailer');
var moment            =  require('moment');





// MULTER && CLOUDINARY CONFIG

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname);
    }
  });

var imageFilter = function (req, file, cb) {
      // accept image files only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
};
  
var upload = multer({ storage: storage, fileFilter: imageFilter})
  
  var cloudinary = require('cloudinary');
  cloudinary.config({ 
    cloud_name: 'sagarparker', 
    api_key:"312946995822893", 
    api_secret:"D0aSm29oEPIUQFvU5eXekd6J3sk"
});


//FREELANCER DETAILS

router.get("/workspace/freelancerdetails",middleware.signUpProcs,function(req,res){
    
    res.render("freelancerDetails");

});

router.post("/workspace/freelancerdetails",middleware.signUpProcs,upload.single('image'),function(req,res){
var UserFname   = req.body.fname;
var UserLname   = req.body.lname;
var UserAge     = req.body.age;
var UserDesig   = req.body.designation;
var UserEdu     = req.body.education;

cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
 if(err) {
   console.log(err);
   return res.redirect('/');
 }
 

// add cloudinary url for the image to the campground object under image property
var FImage = result.secure_url;

// add image's public_id to campground object
var FImageID = result.public_id;

var UserDetailsOwner = req.user._id;

var subdate = moment().format('MMMM Do YYYY');

var newUserDetails={fname         : UserFname,
                    lname         : UserLname,
                    age           : UserAge,
                    designation   : UserDesig,
                    education     : UserEdu,
                    FacCdate      : subdate,
                    Fimage        : FImage,
                    FimageId      : FImageID,
                    InATeam       : false,
                    detailsOwner  : UserDetailsOwner}

if(UserDesig == "Project manager"){
  User.findByIdAndUpdate(req.user._id,{wsuser:"Project manager"},function(err,pmData){
    if(err){
      console.log(err);
    }
  });
}
                    
FreelancerDetails.create(newUserDetails,function(err,fdtls){
if(err){
  console.log(err);
}
else{
  if(UserDesig == "Project manager"){
    // req.flash('success','Welcome to workspace '+UserFname+'!!');
    // res.redirect("/workspace/freelancer/newResume");
    res.render("newfreelancerResume",{user:"PM",uid:req.user._id});
  }
  else{
    res.redirect("/workspace/freelancer/newResume");
  }
 
}
});
});
});

// FREELANCER CREATE RESUME ROUTES

router.get("/workspace/freelancer/newResume",middleware.signUpProcs,function(req,res){
  res.render("newfreelancerResume",{user:"FL",uid:req.user._id});
});



// SKILLS
router.post("/workspace/freelancer/newResume/skills",middleware.signUpProcs,function(req,res){
  FreelancerDetails.findOneAndUpdate({detailsOwner:req.user.id},{$push: {"skills": {newSkill:""+req.body.fskills}}},{safe : true, upsert : true, unique : true},function(err,skillData){
  if(err){
    console.log(err);
  }
  else{
    req.flash('success', req.body.fskills+' added to your skills in resume.');
    res.redirect("/workspace/freelancer/newResume");
  }
});
});

// HOBBIES

router.post("/workspace/freelancer/newResume/hobbies",middleware.signUpProcs,function(req,res){
  FreelancerDetails.findOneAndUpdate({detailsOwner:req.user.id},{$push: {"hobbies": {newHobbies:""+req.body.fhobbies}}},{safe : true, upsert : true, unique : true},function(err,hobbData){
  if(err){
    console.log(err);
  }
  else{
    req.flash('success', req.body.fhobbies+' added to your hobbies in resume.');

    res.redirect("/workspace/freelancer/newResume");
  }
});
});

// EXPERIENCES

router.post("/workspace/freelancer/newResume/experiences",middleware.signUpProcs,function(req,res){
  FreelancerDetails.findOneAndUpdate({detailsOwner:req.user.id},{$push: {"experience": {newExp:""+req.body.fexp}}},{safe : true, upsert : true, unique : true},function(err,expData){
  if(err){
    console.log(err);
  }
  else{
    req.flash('success', 'Experience updated in your resume.');


    res.redirect("/workspace/freelancer/newResume");
  }
});
});










// FREELANCER MEMBERSHIP ROUTES

router.get("/workspace/fMembership",middleware.signUpProcs,function(req,res){
  res.render("membershipFreelancer");
});

///////////// FREE ROUTE

router.post("/workspace/fMembership/free",middleware.signUpProcs,function(req,res){
  var subdate = moment().format('MMMM Do YYYY');

  FreelancerDetails.findOneAndUpdate({detailsOwner:req.user.id},
    {
    FSubDate        : subdate,
    FmembershipType : "Freelancer",  
    FSubDuration    : "",
    FcreditCardName : "",
    FcreditCardCvv  : "",
    FSubExpiry      : "" 
    },function(err,Cpy){
      console.log(Cpy);
    });

  User.findByIdAndUpdate(req.user._id,{Fmembership:"Free"},function(err,Cmem){
      if(err){
          req.flash('error','There was an problem creating your account,please try again later.')
          console.log(err);
      }
      else{
          res.redirect("/workspace/freelancer/teamSelection");
      }
      
  });
  
});

////////////// PAID ROUTE

router.post("/workspace/fMembership/ws",middleware.signUpProcs,function(req,res){
  User.findByIdAndUpdate(req.user._id,{Fmembership:"Ws"},function(err,Cmem){
      if(err){
          req.flash('success', 'Welcome '+req.user.username+",please login.");
          res.redirect("/workspace/loginsignup");
          console.log(err);
      }
      else{
          res.redirect("/workspace/freelancer/payment");
      }
      
  });
});

// PAYMENT ROUTES

router.get("/workspace/freelancer/payment",middleware.signUpProcs,function(req,res){
  res.render("paymentFreelancer");
});

router.post("/payment/freelancer",function(req,res){
  var subdate = moment().format('MMMM Do YYYY');
  if(req.body.month == "1 Month ($10)"){
    var expDate = moment().add(30, 'days').calendar();
  }

  else if(req.body.month == "3 Months ($25)"){
    var expDate = moment().add(90, 'days').calendar();
  }

  else if(req.body.month == "6 Months ($55)"){
    var expDate = moment().add(180, 'days').calendar();
  }

  else if(req.body.month == "12 Months ($110)"){
    var expDate = moment().add(365, 'days').calendar();
  }


  
  FreelancerDetails.findOneAndUpdate({detailsOwner:req.user.id},
      {
      FcreditCardNo   : req.body.crNumber,
      FSubDuration    : req.body.month,
      FcreditCardName : req.body.crName,
      FcreditCardCvv  : req.body.crCvv,
      FSubExpiry      : expDate,
      FmembershipType : "Ws Freelancer",
      FSubDate        : subdate
      },function(err,Cpy){
      console.log(Cpy);
      res.redirect("/workspace/freelancer/teamSelection");
  });

  ////////// SENDIND EMAIL TO THE USER WITH SUBSCRIPTION DETAILS

  const outputF = `
  <h1 style="color:blue"><b>Hello ${req.user.username}!!!</b></h1>
  <h3>Thank you for subscribing to Ws premium.</h3>
  <h3>You are now a Ws Freelancer.</h3>

  <h2><u>Subscription details:-</u></h2>
  <h3>Subscription duration: <span style="color:blue">${req.body.month}</span></h3>
`;

// create reusable transporter object using the default SMTP transport
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
    to: req.user.email, 
    subject: 'Subscription details', 
    text: 'Hello world?', 
    html: outputF
};


transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    else{
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      
      res.redirect("/workspace/freelancer/teamSelection");
    }

});

});

// FREELANCER TEAM SELECTION

router.get("/workspace/freelancer/teamSelection",middleware.signUpProcs,function(req,res){
  FreelancerDetails.findOne({detailsOwner:req.user._id},function(err,frlData){
    if(err){
      console.log(err);
    }
    else{
      res.render("wsTeamSelection",{frlData:frlData});
    }
  
  });
 
});

// ADD NEW TEAM

router.get("/workspace/freelancer/newTeam",middleware.signUpProcs,function(req,res){
    res.render("newTeam");
});


router.post("/workspace/freelancer/newTeam",middleware.signUpProcs,function(req,res){

  var teamEstDate = moment().format('MMMM Do YYYY');

  var newTeamDetails={
                      teamAdmin         : req.user._id,
                      teamName          : req.body.teamName,
                      teamCategory      : req.body.teamCatg,
                      teamDescription   : req.body.teamDescp,
                      teamCreationDate  : teamEstDate,
                      projLive          : false
                    }
  
  WsTeam.create(newTeamDetails,function(err,newTeamDtl){
    WsTeam.findByIdAndUpdate(newTeamDtl._id,{$push: { "frlRequest": {frlID:""+req.user._id}, "teamMembers": {memberID:""+req.user._id} }},{safe : true, upsert : true, unique : true},function(err, model) {
      if(err){
        console.log(err);
      }
      else{
       console.log("Team leader added");
       console.log(newTeamDtl);
       res.redirect("/workspace/freelancer/teamMember/"+newTeamDtl._id+"/"+req.body.teamCatg);
      }
        
    });

    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{InATeam :true},function(err,frlTeamID){
      if(err){
        console.log(err);
      }
      else{
        console.log("Team ID added to freelancers account details.");
      }
    });

   
  });

  


});

//  ADDING TEAM MEMBERS TO THE WS TEAM

router.get("/workspace/freelancer/teamMember/:id/:catg",middleware.signUpProcs,function(req,res){
  var frlList = [];
  var finalList = [];
   
  if(req.params.catg == "Web-development"){
   var query={designation:{$in:["Full-stack Web-developer","Frontend Web-Developer","Backend Web-Developer","Developer (JAVASCRIPT)","UI/UX designer"]}};
  }

  if(req.params.catg == "Application-development"){
    var query={designation:{$in:["Developer (C/C++/C#)","Developer (PYTHON)","Developer (JAVA)","Developer (JAVASCRIPT)"]}};
  }
  if(req.params.catg == "Mobile-Application-development"){
    var query={designation:{$in:["Mobile application developer"]}};
  }
  if(req.params.catg == "Design sprint agency"){
    var query={designation:{$in:["UI/UX designer","Adobe artist"]}};
  }
  if(req.params.catg == "Graphic design"){
    var query={designation:{$in:["Adobe artist","UI/UX designer"]}};
  }
  if(req.params.catg == "Video editing"){
    var query={designation:{$in:["Video editor","Adobe artist"]}};
  }
  if(req.params.catg == "Photo editing"){
    var query={designation:{$in:["Video editor","Adobe artist"]}};
  }
  if(req.params.catg == "Data science"){
    var query={designation:{$in:["Data scientist","Developer (PYTHON)"]}};
  }
  else{
    console.log("No more freelancers.");
  }

  
    FreelancerDetails.find(query,function(err,allFreelancer){
      WsTeam.findById(req.params.id,function(err,wsTeamDetails){
        if(err){
          console.log(err);
        }
        else{
          
          allFreelancer.forEach(function(frlDet){ 
             frlList.push(frlDet.detailsOwner);
          });

          for (var i in frlList) {
            var found = false;
            for (var j in wsTeamDetails.frlRequest) {
               if (frlList[i] === wsTeamDetails.frlRequest[j].frlID) 
               {
                 found = true;
               }
            }
            if (found === false){
              finalList.push(frlList[i]);
            } 
         }
         
        
          
          res.render("newTeamMember",{freelancerList:allFreelancer,teamID:req.params.id,teamCtg:req.params.catg,wsTeam:finalList,wsTeamDtl:wsTeamDetails});
        }
      });
   
    

    });

    FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{FTeamID:req.params.id},function(err,frlTeamID){
      if(err){
        console.log(err);
      }
      else{
        console.log("Team ID added to freelancers account details.");
      }
    });
});

// FREELANCER REQUEST

router.post("/workspace/freelancer/teamMember/:id/:userId/:fname/:lname/:teamName/:teamCtog",middleware.signUpProcs,function(req,res){

  WsTeam.findByIdAndUpdate(req.params.id,{$push: {"frlRequest": {frlID:""+req.params.userId}}},{safe : true, upsert : true, unique : true},function(err, model) {
        if(err){
          console.log(err);
        }
        else{
          req.flash('success', 'Request sent to '+req.params.fname+' '+req.params.lname+',please wait for the response.');
          res.redirect("/workspace/freelancer/teamMember/"+req.params.id+"/"+req.params.teamCtog);
        }
          
      });

  FreelancerDetails.findOneAndUpdate({detailsOwner:req.params.userId},{$push: {"TeamRequest":{teamID:""+req.params.id,teamName:""+req.params.teamName}}},{safe : true, upsert : true,unique : true},function(err,frlTeamReq){
    if(err){
      console.log(err);
    }
    else{
      console.log("Team added to the user data");
    }
  });
});





// FINAL TEAM 

router.get("/workspace/freelancer/finalTeam/:id",middleware.signUpProcs,function(req,res){
  FreelancerDetails.find({},function(err,allFreelancerDetl){
    WsTeam.findById(req.params.id,function(err,wsFinalTeam){
      if(err){
        console.log(err);
      }
      else{
        console.log(wsFinalTeam);
        res.render("finalTeam",{allFreelancerDetl:allFreelancerDetl,wsFinalTeam:wsFinalTeam});
      }
    });
  });

  
});

// REMOVE REQUEST

router.post("/workspace/freelancer/reqst/:teamID/:frlID",middleware.signUpProcs,function(req,res){
  WsTeam.findByIdAndUpdate(req.params.teamID,{$pull: {"frlRequest": {frlID:""+req.params.frlID}}},{safe : true, upsert : true, unique : true},function(err,abc){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/workspace/freelancer/finalTeam/"+req.params.teamID);
    }
  });
});

// JOIN A TEAM 

router.get("/workspace/freelancer/joinTeam/:id",middleware.signUpProcs,function(req,res){
  var frlListreq   = [];
 
  var finalListreq = [];
   
  WsTeam.find({},function(err,allWsTeam){
    FreelancerDetails.findOne({detailsOwner:req.params.id},function(err,userDetails){
      if(err){
        console.log(err);
      }
      else{
 

        allWsTeam.forEach(function(allTeam){ 
          frlListreq.push(allTeam._id);
        });

       for (var i in frlListreq) {
        var found = false;
        for (var j in userDetails.frlJoinTeamReqID) {
           if (frlListreq[i] == userDetails.frlJoinTeamReqID[j].TeamID) 
           {
             found = true;
            
           }
        }
        if (found === false){
          finalListreq.push(frlListreq[i]);
   
        } 
        }
      

      res.render("frlJoinTeam",{allWsTeam:allWsTeam,userID:req.params.id,finalTeam:finalListreq});
      }
    });
  
  });
  
});

//JOIN TEAM INFO

router.get("/workspace/freelancer/joinTeamInfo/:id",middleware.signUpProcs,function(req,res){
  FreelancerDetails.find({},function(err,reqFreelancerDetl){
      WsTeam.findById(req.params.id,function(err,reqWsTeam){
        if(err){
          console.log(err);
        }
        else{
          console.log(reqWsTeam.teamAdmin);
          res.render("teamJoinInfo",{reqFreelancerDetl:reqFreelancerDetl,reqWsTeam:reqWsTeam,joinTeamID:req.params.id});
        }
      });
  });
  
});

//SENDING REQUEST TO TEAM ADMIN TO JOIN THEIR TEAM

router.post("/workspace/freelancer/sendReq/:id/:name/:teamid",middleware.signUpProcs,function(req,res){
  FreelancerDetails.findOneAndUpdate({detailsOwner:req.params.id},{$push: {frlJoinTeamReq:{frlJoinTeamID:""+req.user._id}}},{safe : true, upsert : true,unique : true},function(err,frlinfo){
    if(err){
      console.log(err);
    }
    else{
      console.log(frlinfo);
      req.flash("success","Request sent to "+req.params.name+",please wait for the response.");
      res.redirect("/workspace/freelancer/joinTeam/"+req.user._id);
    }
  });

  FreelancerDetails.findOneAndUpdate({detailsOwner:req.user._id},{$push: {"frlJoinTeamReqID":{TeamID:""+req.params.teamid}}},{safe : true, upsert : true,unique : true},function(err,teamID){
    if(err){
      console.log(err);
    }
    else{
      console.log("Team added to users request list");
    }
  });
});

router.get("/workspace/freelancer/finishJoinTeam/:id",middleware.signUpProcs,function(req,res){
  res.redirect("/workspace/loginsignup/signUpEnd/"+req.params.id);
});

router.get("/workspace/pmsignupend/:id",middleware.signUpProcs,function(req,res){
  res.redirect("/workspace/loginsignup/signUpEnd/"+req.params.id);
})


// END OF SIGNUP

router.get("/workspace/loginsignup/signUpEnd/:id",middleware.signUpProcs,function(req,res){
  FreelancerDetails.find({detailsOwner:req.params.id},function(err,FrlData){
    if(err){
      console.log(err);
    }
    else{
    
      req.flash('success','Welcome to workspace '+FrlData[0].fname+'!!');
      res.redirect("/workspace/loginsignup");
    }
  });

});







module.exports = router;