const middlewareObj = {};

middlewareObj.isLoggedIn = function (req,res,next){

    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash("error","Please login and try again.");
        res.redirect("/workspace/loginsignup");
    }
}

middlewareObj.signUpProcs   = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash("error","There was an error please try again.")
        res.redirect("/workspace/loginsignup");
    }
}

module.exports = middlewareObj;