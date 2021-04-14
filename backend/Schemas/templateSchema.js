const  mongoose=require("mongoose");
       fs=require("fs");
       Container = require("./containerSchema");

mongoose.connect("mongodb://localhost:27017/UrCV", {useNewUrlParser: true , useUnifiedTopology: true } );

let templateSchema=new mongoose.Schema({
    name:String,
    id:String,
    containers:{
        type:[{type:mongoose.Schema.Types.ObjectId,ref:'containers'}],
        default:[]
    }
    
})

let Template=mongoose.model('templates',templateSchema)

let retrieve=async(id)=>{
    let template=await Template.findById(id)
    template.containers=await Promise.all(template.containers.map(async(container)=>{
        return await Container.retrieve(container._id)
    }))
    return template
}


let getContainerIds=async(id)=>{
    let template=await Template.findById(id)
    let cids=[]
    await Promise.all(template.containers.map(async(container)=>{
        await Container.getContainerIds(container._id,cids)

    }))
    return cids
    
    

}

Template.retrieve=retrieve
Template.getContainerIds=getContainerIds
module.exports=Template
