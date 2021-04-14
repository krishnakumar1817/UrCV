const mongoose=require("mongoose");
      fs=require("fs");
mongoose.connect("mongodb://localhost:27017/UrCV", {useNewUrlParser: true , useUnifiedTopology: true } );

let containerSchema=new mongoose.Schema({
    id:{type:String,default:""},
    classlist:{type:[String],default:[]},
    styles:{type:Object,default:{}},
    tag:{type:String,default:'div'},
    children:{
        type:[{type:mongoose.Schema.Types.ObjectId,ref:'containers'}],
        default:[]
    },
    contents:{type:Object,default:{}}

})
let insert=async(...args)=>{
    // console.log(args);
    let ids=await Promise.all(args.map(async(div)=>{
       return await div.save()
    }))
    // console.log(ids)
    return ids.map((ele)=>ele._id)
}


//Recursively populate the children of the containers and return it
let retrieve=async(id)=>{
    let current=await Container.findById(id).populate('children');
    if(current===null || current===undefined) return current
    if(current.children.length==0)
        return current
    current.children=await Promise.all(current.children.map(async(child)=>await retrieve(child._id)))
    return current
}


let getContainerIds=async(id,arr)=>{
    let current=await Container.findById(id)
    arr.push(current._id)
    if(current.children.length==0)
        return 
    await Promise.all(current.children.map(async(child)=>await getContainerIds(child._id,arr)))
    return
}


//Delete a container synchronously along with all its children
let deleteContainer=async(id)=>{
    let cont=await Container.findById(id)
    if(cont===null || cont===undefined) return
    if(cont.children===undefined || cont.children.length===0){
            await Container.deleteOne({_id:id})
            return 1
        }
    await Promise.all(cont.children.map(async(child)=>{
        await deleteContainer(child)
    }))
    await Container.deleteOne({_id:id})
    return 1
}

//Add containers recursively
let addContainers=async(component)=>{
    if(component===undefined || component===null) return 
    let cont={...component,children:[]}
    if(cont._id){
        delete cont._id
    }
    if(component.children===undefined || component.children.length===0){
        cont = new Container(cont)
        cont=await cont.save()
        return  mongoose.Types.ObjectId(cont._id)
    }
    cont.children=await Promise.all(component.children.map(async(child)=>{
        return await addContainers(child)
    }))
    cont = new Container(cont)
    cont=await cont.save()
    return  mongoose.Types.ObjectId(cont._id)

}

//Modify a container and add the children if not already inserted
let modifyContainer=async(id,component)=>{
    let cont=await Container.findById(id)
    if(cont.children){

        await Promise.all(cont.children.map(async(child)=>{
            await deleteContainer(child)
            // console.log("deleted")
        }))
    }

    Object.keys(component).forEach(async(key)=>{
        if(key!=="children")
            cont[key]=JSON.parse(JSON.stringify(component[key]))
    })
    cont["_id"]=id
    cont.children=await Promise.all(component.children.map(async(child)=>{
        return await addContainers(child)
    }))
    await Container.updateOne({_id:id},{'$set':{children:cont.children, styles:cont.styles, classlist:cont.classlist, tag:cont.tag, contents:cont.contents}})           //Update the contents of the container in the database
    return cont
}


//Create a container and insert it if not already inserted
//Returns the new container to the frontend which updates it in the template
let insertContainer=async(p_id,component,position)=>{
    let cont
    let child=await addContainers(component)
    if(position===-1)
        cont=await Container.updateOne({_id:p_id},{$push:{children:child}},{returnOriginal: false })
    else{
        cont=await Container.updateOne({_id:p_id},
            {"$push":{
                children:
                    {   
                        "$each":[child],
                        "$position":position
                    }
            }},{returnOriginal: false })
    }
    return child
    
}


//Move a container from its parent's children array
let moveContainer=async(id,index,pos)=>{
    if(id===-1){

    }
    else{
        let template=await Container.findById(id)
        console.log(template.children[index],template.children[index+pos])
        let temp=template.children[index]
        template.children[index]=template.children[index+pos]
        template.children[index+pos]=temp
        let res=await Container.findByIdAndUpdate(id,{'$set':{children:template.children}},{new:true, useFindAndModify:false})
        console.log("Updated:",res.children[index],res.children[index+pos])
        return template
    }
}

let Container=mongoose.model('containers',containerSchema)
Container.retrieve=retrieve
Container.getContainerIds=getContainerIds
Container.deleteContainer=deleteContainer
Container.modifyContainer=modifyContainer
Container.insertContainer=insertContainer
Container.addContainers=addContainers
Container.moveContainer=moveContainer
module.exports=Container 