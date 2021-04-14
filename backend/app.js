const express=require("express");
const Container = require("./Schemas/containerSchema");
      app=express();
      bodyParser=require("body-parser");
      fetch=require("node-fetch");
      cors=require("cors");
      mongoose=require("mongoose");
      fs=require("fs");
      path=require("path");
      bcrypt=require("bcryptjs");
      Template=require('./Schemas/templateSchema')      //Template model and functions associated with it
      Website=require("./Schemas/websiteSchema");       //Website model and functions associated with it
      User=require("./Schemas/userSchema")              //User model and functions associated with it
      Tool = require("./Schemas/toolSchema");           //Tool model and functions associated with it
      session=require("express-session")

app.use(cors({credentials:true, origin:["http://localhost:3000","http://192.168.0.13:3000"]}));
app.options('*', cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({limit: '50mb'}));                  //limit enables to parse requests of size less than or equal to 50mb...Anything bigger the request will not be processed
app.use(express.static(path.join(__dirname,'/public')));

mongoose.connect("mongodb://localhost:27017/UrCV", {useNewUrlParser: true , useUnifiedTopology: true } );

app.use(session({
      resave:true,
      secret:"Failures are the stepping stones of success",
      saveUninitialized:true,
      name:"UrCvcookie",
      cookie : {
            maxAge: 1000* 60 * 60 *24 * 365,
            secure:false,
        }

}))

//Middleware to disable the cache ---FINAL
let disableCache=(req,res,next)=>{
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      next();
  }
app.use(disableCache)



//Middleware to save the previous request ----FINAL
const savePrev=(req,res,next)=>{
      req.session.redirectTo=req.url;
      next();
}


//Store the user details in each of the request for the logged in user ---FINAL
let loggedinUserDetails=(req,res,next)=>{
      let loggedin=0;
      let username="";
      if(req.session.loggedin==true){
          loggedin=1;
          username=req.session.username;
      }
      res.locals={user:username,loggedin:loggedin};

      next();
  }
app.use(loggedinUserDetails);


//Check if the user is logged in
let isLoggedin=(req,res,next)=>{
      if(req.session.loggedin)
          next();
      else
      {     
            // res.status(404).json({"log_data":"Not logged in",...res.locals})
            res.status(401).send("Not logged in");
      }
  }


//Check if the user is not already logged in
let notLoggedin=(req,res,next)=>{
      // console.log(req.session)
      if(req.session.loggedin==undefined || req.session.loggedin==null)
          next();
      else
          res.status(404).json({log_data:"Already logged in",...res.locals})
  
}

//Append user data to the response
let userData=async(req,res,next)=>{  
      let user={};
      if(req.session.loggedin===true)
            user=await User.findOne({username:req.session.username})
      res.locals={user,...res.locals}
      next()
}

app.get('/',savePrev,async (req,res)=>{
      let templates={},user={},data;
      if(req.session.loggedin===true){ 
            data=await Promise.all([await User.findOne({username:req.session.username},{name:1,username:1,websites:1,gitURL:1}),await Template.find({})])
            user=data[0];
            templates=data[1];
      }
      else
            templates=await Template.find({},{id:1,name:1})
      res.status(200).json({...res.locals,user,templates:templates})
})

//Login post method --- Input sanitization required
app.post('/user/login',notLoggedin,async(req,res)=>{
      // console.log(req.body,"The request",req.session)
      let username=req.body.username;
      let user=await User.findOne({username:username})
      if(user===null){
            res.status(404).json({log_data:"Username doesn't exists"})
            return}
      let match=await bcrypt.compare(req.body.password,user.password)
      if(match===false){
            res.status(401).json({log_data:"Password incorrect"})
            return}
      req.session.loggedin=true
      req.session.username=username
      req.session.save()
      // console.log(req.session)
      res.set("Content-Type","application/json")
      res.status(200).json({user,loggedin:true})

})


//Signup post method ----- Input sanitization required
app.post('/user/signup',notLoggedin,async(req,res)=>{
      let name=req.body.name;
      let username=req.body.username;
      let user=await User.findOne({username:username})
      if(user!==null){
            res.status(409).json({log_data:"Username already exists"})
            return
      }
      if(username===""){
            res.status(404).json({log_data:"Invalid Username"})
            return
      }
      username=username.toLowerCase()
      if(req.body.password===""){
            res.status(404).json({log_data:"Password cannot be empty"})
            return
      }
      let password=await bcrypt.hash(req.body.password,10);
      try{
      let user=await User.create({
            name,
            username,
            password
      })
      }
      catch(err){
            res.status(404).json({log_data:"Server error"})
      }
      req.session.loggedin=true
      req.session.username=username
      req.session.save()
      res.status(202).json({user,loggedin:true})
})


//User logout method destroys the session created ---- FINAL
app.post('/user/logout',isLoggedin,(req,res)=>{
      req.session.destroy();
      res.status(200).json({log_data:"Logged out"})
})

//Match a user's profile and send websites of the user
app.get('/user/profile/:username',isLoggedin,async(req,res)=>{

      if(req.params.username!==req.session.username)
            res.status(406).json({log_data:"Username mismatch"})

      let user=await User.findOne({username:req.params.username})
      if(user===null)
            res.status(404).json({log_data:"User not found"})

      user=await User.populateSites(req.params.username)
      res.status(200).json({user})
})


//Create a website according to the template
app.post('/website/create',isLoggedin,async(req,res)=>{
      let id=req.body.id;  
      let template=req.body.template;
      if(req.session.username!==req.body.username)
            res.status(401).json({log_data:"Unauthorized access"})
      let website_id=await Website.makeSite(id,template)
      let user=await User.findOneAndUpdate({username:req.session.username},{$push:{websites:`${website_id}`}},{returnOriginal: false, upsert: true, setDefaultsOnInsert: true,useFindAndModify: false})
      res.status(200).json({user:user,website_id:website_id})

})
 
app.get('/website/:id',isLoggedin,async(req,res)=>{
      let id=req.params.id;  
      let sites=await User.findOne({username:req.session.username},{websites:1})
      sites=sites.websites
      if(sites.indexOf(id)===-1)
            res.status(401).json({log_data:"Unauthorized access"})
      let site=await Website.retrieve(id);
      res.status(200).json({website:site})

})

app.get('/website/info/:id',isLoggedin,async(req,res)=>{
      let id=req.params.id;  
      let site=await Website.findById(id)
      res.status(200).json({website:site})

})

//To delete a container from a website
app.delete('/website/container/delete',isLoggedin,async(req,res)=>{

      let {id,site}=req.body
      if(id===undefined || id===null)
            res.status(404).json({log_data:"Not found"})
      if(site!==undefined || site!==null){
            try{
                  let res=await Website.deleteContainer(id,site)
                  res.status(200).json({log_data:"Deleted"})
                  return
            }
            catch(e){
                  res.status(200).json({log_data:"Failed"})
                  return
            }
      }
      let val=await Container.deleteContainer(req.body.id)
      res.status(200).json({log_data:"Deleted"})

})


//To modify a container of a website
app.put('/website/container/modify',isLoggedin,async(req,res)=>{
      let {id,component}=req.body
      if(id===undefined || id===null)
            res.status(404).json({log_data:"Not found"})
      let cont=await Container.modifyContainer(id,component)
      res.status(200).json({log_data:"Modified"})

})


//To add a container to a website
app.post('/website/container/insert',isLoggedin,async(req,res)=>{
      let {p_id,component,position,isFull,site}=req.body
      if(p_id===undefined || p_id===null)
            res.status(404).json({log_data:"Not found"})
      if(isFull===true){
            try{
            let newContainer=await Website.insertContainer(component,position,site)
            res.status(200).json({log_data:"Inserted", id:newContainer})
            }
            catch(e){
                  res.status(200).json({log_data:"Failed"})
            }
            return
      }
      else{
      let cont=await Container.insertContainer(p_id,component,position)
      res.status(200).json({log_data:"Inserted", id:cont})
      }
})


//Retrieve a container (Populate the contianer)
app.get('/website/container/retrieve/:id',isLoggedin,async(req,res)=>{
      let id=req.params.id
      try{
            let container=await Container.retrieve(id)
            res.status(200).json({container})
      }
      catch(e){
            res.status(400).json({log_data:"Not found"})
      }
      
})

//Move a container given its parent's id and its index and by number of position it should move
app.put('/website/container/move',isLoggedin,async(req,res)=>{
      let {id,index,pos,isFull,site}=req.body
      if(id===undefined || id===null)
            res.status(404).json({log_data:"Not found"})
      if(isFull===true){
            try{
                  let res=await Website.moveContainer(id,index,pos,site)
                  res.status(200).json({log_data:"Deleted"})
                  return
            }
            catch(e){
                  res.status(200).json({log_data:"Failed"})
                  return
            }
      }
      else{
      let cont=await Container.moveContainer(id,index,pos)
      res.status(200).json({log_data:"Moved"})
      }
})

app.get('/user',async(req,res)=>{
      let user=await User.findById(req.query.id)
      res.json(user) 

})

app.post('/update/:id',(req,res)=>{
      // console.log(req.params.id,req.body.Containers[0].Inner[0].Title,"Insied");
      Website.findByIdAndUpdate(req.params.id,req.body,{new: true, upsert: true, setDefaultsOnInsert: true},(err,res)=>{
            // console.log(err,res.Containers[0].Inner[0].Title,"Otu");
      });
      // console.log(req.url)
      // res.redirect(req.url);
      req.session.upd="PODA"
      req.session.save();
      console.log(req.session,"Accesss tok");
      res.send("Saved");
})


app.get('/template/html/:file',(req,res)=>{

      if(fs.existsSync(path.join(__dirname,'/public/htmlTemplates',req.params.file))){
            let file=fs.readFileSync(path.join(__dirname,'/public/htmlTemplates',req.params.file)).toString()
            res.status(200).json({html:file})
      }
      else{
            res.status(404).json({log_data:"File not found"})
      }



})

//Get the template with its id
app.get('/template/:id',async(req,res)=>{
      try{
            let id=req.params.id
            res.json(await Template.retrieve(`${id}`))
      }
      catch(e){
            res.send("SOrry OOps")                 
            //Error page to be added...................Coldn't find the page you are looking for

      }
})

//Get the access token for github authentication
app.get('/publish/code',isLoggedin,async(req,res)=>{
    console.log(req.headers)  
    return  res.redirect('https://github.com/login/oauth/authorize?client_id=ed386413882419f33d05&scope=public_repo%20user%20delete_repo')
})

app.get('/publish/access_token',isLoggedin,async(req,res)=>{
      let {code}=req.query
      req.session.oauth_code=code
      try{
      let resp=await fetch('https://github.com/login/oauth/access_token',{
            method:"post",
            headers:{'Accept-Type':'application/json'},
            body:JSON.stringify({
                  code:code,
                  client_id:'ed386413882419f33d05',
                  client_secret:'02cebfa889b903c377871f53f29687acad8bcc5e'
                  // redirect_uri:'https://localhost:9000/publish/site'
            })
      })
      resp=await resp.json()
      console.log(resp)
      res.json({log:"success"})
      }
      catch(e){
            res.json({log:"Invalid request"})
      }
})


// app.get('/publish/site',async(req,res)=>{
//       res.json({log:"Success"})
// })

// app.delete('/')

// app.get('/deploy/:id',(req,res)=>{
//       Website.findById("5f1960e6ae19995738827339",(err,result)=>{
//             let website=[result]
//             // let contents=fs.readFileSync(path.join(__dirname,'./Schemas/website.js'));
//             let cont=`const vari=${JSON.stringify([result])}\n`;
//             console.log(cont);
//             fs.writeFileSync(path.join(__dirname,'/deploySites/index2.js'),cont);

//       })
      
// })

// app.get('/website',async(req,res)=>{
//       let template=await Template.findById("5f215e4eca32cc5faca29122")
//       let site=await Website.makeSite()
//       res.json({Template:template,Website:site})
// })

app.get('/website/ret',isLoggedin,async(req,res)=>{
      let site=await Website.retrieve("5f2953d47896ab6f7c0078b2");
      let template=await Template.retrieve("5f215e4eca32cc5faca29122");
      res.json({Template:template,Website:site})
})

//Get the tools and their logo        ---FINAL
app.get('/tools',async(req,res)=>{
      let skills=await Tool.find();
      res.json(JSON.parse(JSON.stringify(skills)))
})

app.get('/jsonview',async(req,res)=>{
      // res.sendFile('/home/krishna/Documents/UrCV/backend/Schemas/editContents.json');
      // res.redirect('/me.svg');   
      res.json(await Template.retrieve("5f215e4eca32cc5faca29125"))
})








// app.get('/testings/:id',(req,res)=>{

//       res.send("Testings"+req.params.id)
// })

// app.get('/testings',(req,res)=>{

//       res.send("Testings me")
// })


































// app.get('/gitauth',(req,res)=>{
//       console.log(req.query.code,"THe code");
//       const code=req.query.code;
//       const client_id='ed386413882419f33d05'
//       const client_secret='02cebfa889b903c377871f53f29687acad8bcc5e'
//       fetch(`https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`,{
//             method:'post',
//             headers:{
//                   accept: 'application/json'
//             }
//       })
//       .then(res=>{
//             console.log(res);
//             return res.json()})
//       .then(resu=>{
//             // console.log(res);
//             // console.log(res.acess_token);
//             const accessToken=resu.access_token;
//             req.session.accessToken=accessToken;
//             console.log(req.session);
//             res.redirect('http://localhost:3000/test/Dev')

//             fetch(`https://api.github.com/user`,{
//                   headers: {
// 				// Include the token in the Authorization header
// 				Authorization: 'token ' + accessToken
// 			}
//             })
//             .then(res=>{
                  
//                  return res.json()})
//             .then(async(res)=>{
                
//                   const user=res.login;
//                   const contents = fs.readFileSync(path.join(__dirname,'/deploySites/index2.html'), {encoding: 'base64'});
//                   fetch(`https://api.github.com/repos/${user}/${user}.github.io/contents/index2.html`,{
//                   method:"put",
//                   body:JSON.stringify({
//                         message:"Deploy in trial",
//                         content:`${contents}`
//                   }),
//                   headers:{
//                         Authorization: 'token ' + accessToken,
//                         accept:"application/vnd.github.v3+json"
//                   }
//             }).then(res=>res.json()).then(res=>{
//                   console.log(res);
//             }).catch(err=>{
//                   console.log(err);
//             })                 
//             })
            
//       }).catch(err=>{
//             console.log(err);
//       })
//       // res.redirect('http://localhost:3000/test/Dev')
     
// })

let server=app.listen(process.env.PORT||9000,(err)=>{    // ---FINAL
      if(err)
            throw err;
      else
            console.log("Connected!");
     

})

