const  mongoose=require("mongoose");
       fs=require("fs");
mongoose.connect("mongodb://localhost:27017/UrCV", {useNewUrlParser: true , useUnifiedTopology: true } );
let toolSchema=new mongoose.Schema({
    tool:String,
    logo:String
})

let Tool=mongoose.model('tools',toolSchema)
module.exports=Tool