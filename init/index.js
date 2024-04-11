const mongoose=require("mongoose");
const initData =require("./data.js");
const Listing=require("../models/listing.js");
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Wanderlust');
  }
main()
.then(()=>{
    console.log("connected to db");
})
.catch((err) => console.log(err));
const initDb=async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"660d05e7973a6eb360f4366d",}));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
};
initDb();