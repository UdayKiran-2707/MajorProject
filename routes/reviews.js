const express=require("express");
const router=express.Router({mergeParams : true});
const ExpressError=require("../utils/ExpressError.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {reviewSchema}=require("../Schema.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");
const ReviewController=require("../controllers/review.js");
router.post("/",isLoggedIn,validateReview,wrapAsync(ReviewController.createReview));
//review delete
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(ReviewController.destroyReview));
module.exports=router;