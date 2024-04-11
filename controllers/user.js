const User=require("../models/user");
module.exports.renderSignupForm=(req,res)=>{
    res.render("user/signup.ejs");
}
module.exports.signup=async(req,res,next)=>{
    try{
        const {username,email,password}=req.body;

        let newUser=new User({email,username});
        const registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
         req.login(registeredUser,(err)=>{
            if(err){
            return  next(err);
         }
         req.flash("success","You Are LoggedIn");
         res.redirect("/listings");
        });
    }
    catch(e){
        req.flash("error",e.message);
    }
}
module.exports.renderLoginForm=(req,res)=>{
    res.render("user/login.ejs");
}
module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){next(err);
        }
        req.flash("success","You are logged out");
        return res.redirect("/listings");
    });
}

module.exports.login=async(req,res)=>{
    req.flash("success","Welcome Back To WanderLust");
    let redirectUrl=res.locals.redirectUrl||"/listings";
    res.redirect(redirectUrl);
    }
