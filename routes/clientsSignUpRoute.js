var express           =  require("express");
var router            =  express.Router();
var passport          =  require("passport");
var User              =  require("../models/user");
var request           =  require("request");
var FreelancerDetails =  require("../models/freelancerDetails");
var ClientDetails     =  require("../models/clientDetails");
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

//CLIENT DETAILS

router.get("/workspace/clientdetails",middleware.signUpProcs,function(req,res){
    res.render("clientDetails");
});

router.post("/workspace/clientdetails",middleware.signUpProcs,upload.single('image'),function(req,res){
    var Cname        = req.body.cname;
    var Cestablsihed = req.body.cest ;
    var companyType  = req.body.companyType;


    
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err) {
          console.log(err);
          return res.redirect('/');
        }
        
 
    // add cloudinary url for the image to the campground object under image property
    var CImage = result.secure_url;

    // add image's public_id to campground object
    var CImageID = result.public_id;
  
    var UserDetailsOwner = req.user._id;

    var subdate = moment().format('MMMM Do YYYY');

   

    var newUserDetails={
                        Cname           :Cname,
                        established     :Cestablsihed,
                        companyType     :companyType,
                        Cimage          :CImage,
                        CacCdate        :subdate,
                        CimageId        :CImageID,
                        detailsOwner    :UserDetailsOwner
                        }
                        
    ClientDetails.create(newUserDetails,function(err,cldts){
    if(err){
        
        console.log(err);
    }
    else{
        res.redirect("/workspace/cMembership");
    }
    });
});
});

// CLIENT MEMBERSHIP ROUTES

router.get("/workspace/cMembership",middleware.signUpProcs,function(req,res){
    res.render("membershipClient");
});

///////////// FREE ROUTE

router.post("/workspace/cMembership/free",middleware.signUpProcs,function(req,res){
    var subdate = moment().format('MMMM Do YYYY');
    ClientDetails.findOneAndUpdate({detailsOwner:req.user.id},
        {
        CSubDate        :subdate,
        CmembershipType :"Client",
        CcreditCardNo   :"",
        CSubDuration    :"",
        CcreditCardName :"",
        CcreditCardCvv  :"",
        CSubExpiry      :"",
        },function(err,Cpy){
        console.log(Cpy);
    });

    User.findByIdAndUpdate(req.user._id,{Cmembership:"Free"},function(err,Cmem){
        if(err){
            console.log(err);
        }
        else{
            req.flash('success', 'Welcome '+req.user.username+",please login.");
            res.redirect("/workspace/loginsignup");
        }
        
    });
});

////////////// PAID ROUTE

router.post("/workspace/cMembership/ws",middleware.signUpProcs,function(req,res){
    User.findByIdAndUpdate(req.user._id,{Cmembership:"Ws"},function(err,Cmem){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/workspace/client/payment");
        }
        
    });
});

// PAYMENT ROUTES

router.get("/workspace/client/payment",middleware.signUpProcs,function(req,res){
    res.render("paymentClient");
});

router.post("/payment/client",middleware.signUpProcs,function(req,res){
    var subdate = moment().format('MMMM Do YYYY');
    if(req.body.month == "1 Month ($50)"){
        var expDate = moment().add(30, 'days').calendar();
    }

    else if(req.body.month == "3 Months ($140)"){
    var expDate = moment().add(90, 'days').calendar();
    }

    else if(req.body.month == "6 Months ($290)"){
    var expDate = moment().add(180, 'days').calendar();
    }

    else if(req.body.month == "12 Months ($550)"){
    var expDate = moment().add(365, 'days').calendar();
    }
    ClientDetails.findOneAndUpdate({detailsOwner:req.user.id},
        {CcreditCardNo:req.body.crNumber,
        CSubDuration:req.body.month,
        CcreditCardName:req.body.crName,
        CcreditCardCvv:req.body.crCvv,
        CSubExpiry:expDate,
        CmembershipType:"Ws Client",
        CSubDate:subdate},function(err,Cpy){
        console.log(Cpy);
        res.redirect("/workspace/client/loginsignup/signUpEnd/"+req.user._id);
    });

    ////////// SENDIND EMAIL TO THE USER WITH SUBSCRIPTION DETAILS

    const output = `
    <h1 style="color:blue"><b>Hello ${req.user.username}!!!</b></h1>
    <h3>Thank you for subscribing to Ws premium.</h3>
    <h3>You are now a Ws Client.</h3>

    <h2><u>Subscription details:-</u></h2>
    <h3>Subscription duration: <span style="color:blue">${req.body.month}</span></h3>
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
      to: req.user.email, 
      subject: 'Subscription details', 
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
        
       
    
      }
   
  });

});

// END OF SIGNUP



router.get("/workspace/client/loginsignup/signUpEnd/:id",middleware.signUpProcs,function(req,res){
    ClientDetails.find({detailsOwner:req.params.id},function(err,clData){
      if(err){
        console.log(err);
      }
      else{
   
        req.flash('success','Welcome to workspace '+clData[0].Cname+'!!');
        res.redirect("/workspace/loginsignup");
      }
    });
  
});


router.get("workspace")



module.exports = router;