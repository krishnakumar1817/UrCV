const mongoose=require("mongoose")
const Website = require("./websiteSchema")
mongoose.connect("mongodb://localhost:27017/UrCV", {useNewUrlParser: true , useUnifiedTopology: true } )
let userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    username:{type:String, unique:true, required:true},
    password:{type:String, required:true},
    websites:[{type:mongoose.Schema.Types.ObjectId,ref:'websites',default:[]}],
    gitURL:{type:String,default:"#"}
})

let User=mongoose.model("users",userSchema)

User.populateSites=async(uname)=>{                          //find user by username

    let user=await User.findOne({username:uname})
    user.websites=await Promise.all(user.websites.map(async(website)=>{return await Website.retrieve(website._id)}))
    return user

}
module.exports=User