var express                =    require("express");
var app                    =    express();
var http                   =    require('http');
var bodyParser             =    require("body-parser");
var indexRoute             =    require("./routes/index");
var clientRoute            =    require("./routes/clientsSignUpRoute");
var clientAccountRoute     =    require("./routes/clientAccountRoute");
var freelancerRoute        =    require("./routes/freelancerSignUpRoute");
var freelancerAccountRoute =    require("./routes/freelancerAccountRoute");
var pmAccountRoute         =    require("./routes/pmAccountRoute");
var mongoose               =    require("mongoose");
var flash                  =    require("connect-flash");
var passport               =    require("passport");
var LocalStrategy          =    require("passport-local").Strategy;
var User                   =    require("./models/user");
var FreelancerDetails      =    require("./models/freelancerDetails");
var ClientDetails          =    require("./models/clientDetails");
var middleware             =    require("./middleware/middleware");
var ChatMsg                =    require("./models/Chat");
var Project                =    require("./models/project");
var methodOverride         =    require("method-override");
var moment                 =    require('moment');
var Schema                 =    mongoose.Schema;
var socketIO               =    require('socket.io');
var port                   =    process.env.PORT || 3000
let server                 =    http.createServer(app);
let io                     =    socketIO(server);

// VIEW ENGINE
app.set("view engine","ejs");


//MONGOOSE CONNECTION


mongoose.connect("mongodb+srv://sagarparker:hihellohi8@sagarparker-ccy2e.mongodb.net/workspaceDB?retryWrites=true&w=majority",
{ useNewUrlParser: true,
  useCreateIndex:true,
  useFindAndModify:false,
}).then(() => {
    console.log("Connected to WorkSpace database");
}).catch(err => {
    console.log("Error connecting to WorkSpace database",err.message);
});


// Middleware
app.use(bodyParser.json());

// BODY_PARSER and PUBLIC DIRECTORY

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));


// FLASH MESSAGES

app.use(flash());


// PASSPORT JS CONFIG

app.use(require("express-session")({
secret:"encode",
resave:false,
saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


// PASSPORT lOCAL STRATEGY

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
  });

// FLASH CONFIG

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error       = req.flash("error");
    res.locals.success     = req.flash("success");
    next();
});



// INDEX ROUTE //

// CONTAINS THE SIGNUP,LOGIN,LOGOUT and USERDETAILS ROUTE
app.use(indexRoute);


// CONTAINS CLIENT ROUTES
app.use(clientRoute);


// CONTAINS FREELANCER ROUTES
app.use(freelancerRoute);


// CONTAINS FREELANCER ACCOUNT ROUTES
app.use(freelancerAccountRoute);

// CONTAINS CLIENTS ACCOUNT ROUTES

app.use(clientAccountRoute);

// CONTAINS PROJECT MANAGER ROUTES

app.use(pmAccountRoute);


// SOCKET.IO CONFIGURATION

//Freelancer chat

var roomID;

app.get("/workspace/chat/:teamIDD/:name",middleware.isLoggedIn,function(req,res){


    User.findById(req.user._id,function(err,usrData){
        Project.findById(req.params.teamIDD,function(err,prjData){
            if(err){
                console.log(err);
            }
            else{
                console.log(prjData);
                res.render("freelancerAccount/teamchat",{teamNa:req.params.teamIDD,uname:req.params.name,usrData:usrData,prjData:prjData});
            }
        });
    });
   
    
    roomID = req.params.teamIDD;
   
});


io.on('connection',function(socket){
   var teamID;
   var unm;
    socket.on('teamName',function(tid){
        teamID = tid;
    });

    socket.on('chat message', function(msg){
    var msgDate = moment().format('h:mm a, MMM Do YYYY'); 
    var newMsg = new ChatMsg({msg:msg,uname:unm,teamID:teamID,msgTime:msgDate});
    newMsg.save(function(err){
        if(err) throw err;
        io.to(teamID).emit('chat message', msg);
    })
     
    });
    socket.on('uname',function(un){
        unm = un;
        io.to(teamID).emit('uname',un);
    });

    socket.on('uDate',function(un){
        io.to(teamID).emit('uDate',un);
    });
  });
  


io.on('connect',function(socket){
    ChatMsg.find({teamID:roomID},function(err,docs){
        if(err) throw err;
        socket.emit('load old msgs',docs);
    })
    socket.join(roomID);

    console.log('a user connected:');
  
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});




// SERVER PORT

server.listen(port,function(){
    console.log("Workspace server started");
});






