const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const Map_Token=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: Map_Token});

module.exports.index=async (req,res,next)=>{
    let allListings = await Listing.find();
 const { country } = req.query;
    // Filter listings based on the country
    const cityListings = country? allListings.filter(listing => listing.country.toLowerCase() === country.toLowerCase()): allListings;
res.render('./listings/index.ejs', { allListings });
  }
  module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
}
  module.exports.showListing=async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate({path:"review",populate:{path:"author"},}).populate("owner");
        if (!listing) {
            req.flash("error","Listing requested for is deleted");
            res.redirect("/listings");
        }
        console.log(listing);
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        // Pass the error to the error handling middleware
        next(err);
    }
}
module.exports.createListing=async (req,res)=>{
  let response=await  geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();

   let url=req.file.path;
   let filename=req.file.filename;
   console.log(url,"..",filename);
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success","New listing created!");
    res.redirect("/listings");
}
module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if (!listing) {
        req.flash("error","Listing requested for is deleted");
        res.redirect("/listings");
    }
    let originalImage=listing.image.url;
    let originalImageUrl=originalImage.replace("/upload","/upload/w_250");
    res.render("./listings/edit.ejs",{listing,originalImageUrl});
}
module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
 if(typeof req.file!=undefined){
    let url=req.file.path;
   let filename=req.file.filename;
   listing.image={url,filename};
   await listing.save();
}
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}
module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
   let deletedmsg= await Listing.findByIdAndDelete(id);
   req.flash("success","Listing Deleted!");
   res.redirect("/listings");
}