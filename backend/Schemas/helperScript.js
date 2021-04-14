const  mongoose=require("mongoose");
       Template = require("./templateSchema");
       fs=require("fs");
       Container = require("./containerSchema");
       Website=require("./websiteSchema");
       User=require("./userSchema")

let ids=["5f215e4eca32cc5faca29122","5f293f4fb4fe004d5c5080f2",
"5f293fcaf555334ee3a75f00","5f215e4eca32cc5faca29124","5f215e4eca32cc5faca29125"]


let containers=[];
(async()=>{

    let conts=await Promise.all(ids.map(async(id)=>await Template.getContainerIds(id))) 
    let sum=0;
    for(let i=0; i<ids.length; i++){
        console.log("Template: "+ids[i]+" "+conts[i].length+"\n")
        sum+=conts[i].length
        containers.push(...conts[i])
    }

    // containers= [...new Set(containers)];
    let s=new Set(containers)
    console.log(containers.length,sum,s.size)
    let res=await Container.remove({_id: {$nin:containers}})
    res=await Website.deleteMany({})
    res=await User.findOneAndUpdate({username:"test"},{websites:[]},{returnOriginal:false})
    console.log(res)
    



    // res=res.map(r=>r._id)
    // res.sort()
    // containers.sort();
    // console.log(containers.length,res.length)
    // console.log(JSON.stringify(containers)==JSON.stringify(res))

    // console.log(containers.length,sum)
    // let res=await Container.find({_id: {$in:conts[2]}},{_id:1})
    // res=res.map(r=>r._id)
    // res.sort()
    // conts[2].sort();
    // console.log(conts[2],res,conts[2].length,res.length)
    // console.log(JSON.stringify(conts[2])==JSON.stringify(res))

    return ids
})()




