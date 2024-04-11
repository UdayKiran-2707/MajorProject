if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}
console.log(process.env);
const express=require('express');
const app=express();
const mongoose = require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
const {listingSchema,reviewSchema}=require("./Schema.js");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const Review=require("./models/review.js");
const listingsRoute=require("./routes/listing.js");
const reviewsRoute=require("./routes/reviews.js");
const userRoute=require("./routes/user.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");
const dbUrl=process.env.ATLASDB_URL;

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
   console("error in mongo atlas is ",err);
});


const sessionReq={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
    expires:Date.now()*7*24*60*60*1000,
    maxAge:7*24*60*60*1000
    },
    httpOnly:true
};

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
main()
.then(()=>{
    console.log("connected to db");
})
.catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.use(session(sessionReq));
app.use(flash());




app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.use("/listings",listingsRoute);
app.use("/listings/:id/reviews",reviewsRoute);
app.use("/",userRoute);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
let {status=500,message="Something went wrong"}=err;
res.status(status).render("error.ejs",{err});
});



app.listen(8000,()=>{
    console.log("app is listening");
});