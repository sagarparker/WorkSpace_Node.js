var express           =  require("express");
var router            =  express.Router();
var passport          =  require("passport");
var User              =  require("../models/user");
var request           =  require("request");
var FreelancerDetails =  require("../models/freelancerDetails");
var ClientDetails     =  require("../models/clientDetails");
var ProjectDetails    =  require("../models/project");
var wsTeamDetails     =  require("../models/wsTeam");
var middleware        =  require("../middleware/middleware");
var multer            =  require("multer");
var async             =  require("async");
var crypto            =  require("crypto");
var nodemailer        =  require("nodemailer");



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

// // DEAFULT ROUTE

router.get("/",function(req,res){
    res.redirect("/workspace");
});

// STATIC ROUTES

router.get("/workspace",function(req,res){

    res.render("landingPage");
});

// ABOUT PAGE

router.get("/workspace/aboutus",function(req,res){
    res.render("aboutPage");
});

//CONTACT ROUTE

router.get("/workspace/contact",function(req,res){
    res.render("contactPage");
    
});

router.post("/workspace/contact",function(req,res){
  ////////// SENDIND EMAIL TO THE USER WITH SUBSCRIPTION DETAILS

  const output = `
<div style="width:400px;border:5px solid black;padding:30px">
<h1 style="text-center">WorkSpace</h1>
<h2><span style="color:blue">From: </span>${req.body.contEmail}</h2>
<hr>
<h2 style="color:blue"><u>Message:-</u></h2>
<h3>${req.body.contMessage}</h3>
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
    from: req.body.contEmail, 
    to: 'workspacews8@gmail.com', 
    subject: 'Message from '+req.body.contEmail,  
    html: output 
};


transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);   
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    res.render("contactPage");
});


});




// LOGOUT ROUTE
router.get("/workspace/logout",function(req,res){
    req.logOut();
    req.flash('success','Logged out');
    res.redirect("/workspace/loginsignup");

});

// LOGIN/SIGNUP ROUTES

router.get("/workspace/loginsignup",function(req,res){
    res.render("login_signup_Page");
});

//LOGIN ROUTE

router.post("/workspace/login", 
  passport.authenticate('local', { failureRedirect: '/workspace/loginsignup',failureFlash:true }),
  function(req, res) {
  
    
    console.log("Logged in as:"+req.user.wsuser);

    if(req.user.wsuser == "client"){
        res.redirect("/workspace/client");
    }
    else if(req.user.wsuser == "freelancer"){
        res.redirect("/workspace/freelancer");
    }
    else if(req.user.wsuser == "Project manager"){
        res.redirect("/workspace/projectmanager")
    }
    else{
      
        res.redirect("/workspace/loginsignup");
    }
    
   
});


  

// SIGNUP POST 

router.post("/workspace/signup",function(req,res){
    User.register(new User({email:req.body.email,wsuser:req.body.wsuser,username: req.body.username}),req.body.password,function(err, user){
        if(err){
            return res.render("login_signup_Page",{error: err.message});
        }
        else{
            passport.authenticate("local")(req,res,function(){
               
                if(req.body.wsuser == "client"){
                    res.redirect("/workspace/clientdetails");
                }
                if(req.body.wsuser == "freelancer"){
                    res.redirect("/workspace/freelancerdetails");
                }
                
            });
        }
    });
});



// PASSWORD RESET

router.get('/workspace/fpassword',function(req, res) {
    res.render('fpassword');
  });
  
  router.post('/workspace/fpassword', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email,username:req.body.uname }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/workspace/fpassword');
          }
  
          user.resetPasswordToken = token;
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'workspacews8@gmail.com',
            pass: 'workspace123'
          }
        });

        const rpl = `
        <div style="border:5px solid black;padding:30px;width:600px">
        <h1 style="color:blue;font-weight:bold;margin-bottom:20px;font-size:3em">WorkSpace</h1>
        <h2><b></b>You are receiving this because you (or someone else) have requested the reset of the password for your account.</h2>
        <hr>
        <h2>Please click on the following link, or paste this into your browser to complete the process:</h2>
        <h2>http://${req.headers.host}/workspace/passwordReset/${token} </h2>
      
        </div>
      
        `;

        var mailOptions = {
          to: user.email,
          from: 'workspacews8@gmail.com',
          subject: 'WorkSpace account password reset.',
          html:rpl
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/workspace/fpassword');
    });
  });
  
  // RESET PASWORD CONFIRM PAGE

  router.get('/workspace/passwordReset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token}, function(err, user) {
        console.log(user);
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/workspace/fpassword');
      }
      res.render('passwordReset', {token: req.params.token});
    });
  });
  
  router.post('/workspace/passwordReset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({resetPasswordToken: req.params.token}, function(err, user) {
            console.log("Post vala:"+user);
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            console.log("Password reset token is invalid or has expired.")
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              console.log("Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'workspacews8@gmail.com',
            pass: 'workspace123'
          }
        });

        const spr =`
        <h1>Hello ${user.username}</h1>
        <h2>This is a confirmation that the password for your account ${user.email} has just been changed.</h2>
        `;

        var mailOptions = {
          to: user.email,
          from: 'workspacews8@gmail.com',
          subject: 'Your password has been changed',
          html:spr
        };
        smtpTransport.sendMail(mailOptions, function(err) {
        
          console.log("Success! Your password has been changed.")
          done(err);
        });
      }
    ], function(err) {
      req.flash('success', 'Your password has been changed.');
      res.redirect('/workspace/loginsignup');
    });
  });

// PROJECT HOME PAGE ROUTING

// PROJECT CLIENT DETAILS

router.get("/workspace/project/PrjclientDetails/:cid/:utype",middleware.isLoggedIn,function(req,res){
  ClientDetails.findOne({detailsOwner:req.params.cid},function(err,clData){
    if(err){
      console.log(err);
    }
    else{
      console.log(clData);
      res.render("projectViews/prjClientDetails",{clData:clData,utype:req.params.utype});
    }
  });
});

// PROJECT DETAILS

router.get("/workspace/project/prjDetails/:pid/:utype",middleware.isLoggedIn,function(req,res){
  ProjectDetails.findById(req.params.pid,function(err,pData){
    if(err){
      console.log(err);
    }
    else{
      res.render("projectViews/projectDetails",{pData:pData,utype:req.params.utype});
    }
  });
});


// WS TEAM DETAILS

router.get("/workspace/project/wsTeamDetails/:pid/:utype",middleware.isLoggedIn,function(req,res){
  ProjectDetails.findById(req.params.pid,function(err,pData){
    wsTeamDetails.findById(pData.pTeam,function(err,teamData){
      FreelancerDetails.findOne({detailsOwner:pData.pManager},function(err,pmData){
        FreelancerDetails.find({},function(err,fdtls){
          if(err){
            console.log(err);
          }
          else{
            res.render("projectViews/wsTeamDetails",{pData:pData,fdtls:fdtls,utype:req.params.utype,teamData:teamData,pmData:pmData});
          }
        });
      });
    });
  });
});


// PROJECT REVIEW

router.get("/workspace/project/review/:pid/:pname/:uname/:utype",middleware.isLoggedIn,function(req,res){
  ProjectDetails.findById(req.params.pid,function(err,pData){
    if(err){
      console.log(err);
    }
    else{
      res.render("projectViews/projectReview",{pData:pData,uname:req.params.uname,utype:req.params.utype});
    }
  });
});


router.post("/workspace/project/review/:pid/:pname/:uname/:utype",middleware.isLoggedIn,function(req,res){
  ProjectDetails.findByIdAndUpdate(req.params.pid,{$push:{"PrjReviews":{
                                                                          projectID   :  req.params.pid,
                                                                          name        :  req.params.uname,
                                                                          revTxt      :  req.body.txtReview,
                                                                          stars       :  req.body.prjRating  
                                                                        }
                                                   }},{safe : true, upsert : true,unique : true},function(err,pd){
                                                      if(err){
                                                        console.log(err);
                                                      }
                                                      else{
                                                        req.flash('success','Review added to the project');
                                                        res.redirect("/workspace/project/review/"+req.params.pid+"/"+req.params.pname+"/"+req.params.uname+"/"+req.params.utype);
                                                      }
                                                });
});


// CLIENT REVIEW

router.get("/workspace/project/client/review/:cid/:pid/:pname/:uname/:utype",middleware.isLoggedIn,function(req,res){
  ClientDetails.findOne({detailsOwner:req.params.cid},function(err,clData){
    if(err){
      console.log(err);
    }
    else{
      res.render("projectViews/prjClientReview",{clData:clData,uname:req.params.uname,utype:req.params.utype,pname:req.params.pname,pid:req.params.pid,cid:req.params.cid});
    }
  });
});


router.post("/workspace/project/client/review/:cid/:pid/:pname/:uname/:utype",middleware.isLoggedIn,function(req,res){
  ClientDetails.findOneAndUpdate({detailsOwner:req.params.cid},{$push:{"clReviews":{
                                                                          projectID   :  req.params.pid,
                                                                          name        :  req.params.uname,
                                                                          revTxt      :  req.body.rTxt,
                                                                          stars       :  req.body.stars  
                                                                        }
                                                   }},{safe : true, upsert : true,unique : true},function(err,pd){
                                                      if(err){
                                                        console.log(err);
                                                      }
                                                      else{
                                                        req.flash('success','Review posted');
                                                        res.redirect("/workspace/project/client/review/"+req.params.cid+"/"+req.params.pid+"/"+req.params.pname+"/"+req.params.uname+"/"+req.params.utype);
                                                      }
                                                });
});


// WSTEAM REVIEW

router.get("/workspace/project/wsTeamReview/:tid/:pid/:pname/:uname/:utype",middleware.isLoggedIn,function(req,res){
  
    ProjectDetails.findById(req.params.pid,function(err,pd){
      FreelancerDetails.find({},function(err,fd){
        wsTeamDetails.findById(req.params.tid,function(err,wsd){
          if(err){
            console.log(err);
          }
          else{
            res.render("projectViews/wsTeamReview",{wsd:wsd,tid:req.params.tid,pd:pd,fd:fd,pmid:req.params.pid,pid:req.params.pid,pname:req.params.pname,uname:req.params.uname,utype:req.params.utype});
          }
        });
      });
    });
});

// FREELANCER REVIEWS

router.post("/workspace/project/wsTeamReview/:tid/:fid/:pid/:pname/:uname/:utype",middleware.isLoggedIn,function(req,res){
  FreelancerDetails.findOneAndUpdate({detailsOwner:req.params.fid},{$push:{"frlReviews":{
                                                                          projectID   :  req.params.pid,
                                                                          name        :  req.params.uname,
                                                                          revTxt      :  req.body.rTxt,
                                                                          stars       :  req.body.stars  
                                                                        }
                                                   }},{safe : true, upsert : true,unique : true},function(err,pd){
                                                      if(err){
                                                        console.log(err);
                                                      }
                                                      else{
                                                        req.flash('success','Review posted');
                                                        res.redirect("/workspace/project/wsTeamReview/"+req.params.tid+"/"+req.params.pid+"/"+req.params.pname+"/"+req.params.uname+"/"+req.params.utype);
                                                      }
                                                });
});

// TEAM REVIEW

router.post("/workspace/project/teamReview/:tid/:pid/:pname/:uname/:utype",middleware.isLoggedIn,function(req,res){
  wsTeamDetails.findByIdAndUpdate(req.params.tid,{$push:{"wsTeamReviews":{
                                                                          projectID   :  req.params.pid,
                                                                          name        :  req.params.uname,
                                                                          revTxt      :  req.body.rTxt,
                                                                          stars       :  req.body.stars  
                                                                        }
                                                   }},{safe : true, upsert : true,unique : true},function(err,pd){
                                                      if(err){
                                                        console.log(err);
                                                      }
                                                      else{
                                                        req.flash('success','Review posted');
                                                        res.redirect("/workspace/project/wsTeamReview/"+req.params.tid+"/"+req.params.pid+"/"+req.params.pname+"/"+req.params.uname+"/"+req.params.utype);
                                                      }
                                                });
});

// TEAM ADMIN MARK PROJECT COMPLETED

router.post("/workspace/project/exitProject/:tid/:fid/:pid/:pname/:uname/:utype",function(req,res){
  wsTeamDetails.findByIdAndUpdate(req.params.tid,{projLive:false},function(err,wsd){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/workspace/freelancer/project/"+req.params.pid+"/"+req.params.pname+"/"+req.params.fid);
    }

  });
});



module.exports = router;

    




