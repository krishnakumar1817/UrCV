import React, { Component } from 'react';
import Autocomplete from '../Components/Autocomplete'
// import {
//     BrowserRouter as Router,
//     Route,
//     Link,
//     Switch
//   } from "react-router-dom";
import '../css/SkillEditor.css'

class Skillset extends Component {
    constructor(props){
        super(props);
        this.state={global_skills:[],basic_skills:[],intermediate_skills:[],advanced_skills:[],
                    innerPage:{
                        isInner:false,
                        level:""                        
                    },
                    insertPosition:{
                        index:-1,
                        pos:0
                    }
                    }

        
    }

    skilltemplate=()=>{
        
    }

    //Extract the skills from the skill-box specified as node
    extractSkills=(node,set,index)=>{
        if(node.children===undefined || node.children.length===0){  //Check for leaf node
            if(node.contents!==undefined)                           //Check for empty skill set
                if(node.contents.text!==undefined)
                    {
                    set.push(node.contents.text)
                    return
                    }
        }

        for(let i=0; i<node.children.length; i++)
            this.extractSkills(node.children[i],set,index+`:${i}`)
        

    }
    

    //Classify the skills as basic,intermediate and advanced
    classifySkills=()=>{
        let skills=this.props.component
        let basic_skills=[],intermediate_skills=[],advanced_skills=[]
        this.extractSkills(skills.children[0],basic_skills,`${this.props.index}:0`)               
        this.extractSkills(skills.children[1],intermediate_skills,`${this.props.index}:1`)      
        this.extractSkills(skills.children[2],advanced_skills,`${this.props.index}:2`)
        return {basic_skills,intermediate_skills,advanced_skills}
    }


    //Extract the skills and classify; Get the tool list from the server
    componentDidMount=async()=>{
        let tools=await fetch ('http://localhost:9000/tools')
        let skills=await tools.json()
        let {basic_skills,intermediate_skills,advanced_skills}=this.classifySkills()
        // console.log(basic_skills,intermediate_skills,"COMPONENT DID MOUNT")
        this.setState({global_skills:skills,basic_skills,intermediate_skills,advanced_skills},(err,res)=>{
            if(err)
                throw err;
            // console.log(this.state)

        })
    }   

    //Enable or disable the inner page
    changeInner=(level="")=>{
            this.setState({innerPage:{isInner:!this.state.innerPage.isInner,level}})   
    }


    setAddPos=(index,pos)=>{
        this.setState({insertPosition:{index,pos}})
    }


    moveSkill=(index,p_id,pos)=>{
        let level=this.state.innerPage.level
        let set=[...this.state[`${level}_skills`]]
        // console.log(set,"The touched skill")
        if(pos===-1 && index===0)
            return 0;
        if(pos===1 && index===set.length-1)
            return 1;
        let temp=set[index]
        set[index]=set[index+pos]
        set[index+pos]=temp
        this.setState({[`${level}_skills`]:set})
        this.props.moveSkill(p_id,pos)
        
    }

    deleteSkill=(index,p_id)=>{
        // console.log(index)
        let set,old
        let level=this.state.innerPage.level
        set=[...this.state[`${level}_skills`]]
        old=[...set]
        set.splice(index,1)
        this.setState({[`${level}_skills`]:set})
        let res=this.props.removeSkill(p_id)
        if(res===0)
        {
            this.setState({[`${level}_skills`]:old})
        }


    }

    //Final for the trial template---------------
    //Make a skill element --- with logo as img and tool as text
    makeSkill=(skill,template)=>{                 
        if(!template)
            return
        if(template.tag==="img" && template.children.length===0)
            template.contents["src"]=skill.logo;
        if(template.tag==="span" && template.children.length===0)
            template.contents["text"]=skill.tool;
        if(template.children)
        for(let i=0; i<template.children.length; i++)
            this.makeSkill(skill,template.children[i])
        return 
        

    }

    //create a skill and add it to the local state and update the parent
    createSkill=(index,position=-1)=>{                //position -- where to add the skill

        //Validating skill's presence
        const {basic_skills,intermediate_skills,advanced_skills,global_skills,innerPage:{level}}=this.state;
        let skill=global_skills[index].tool.toLowerCase()

        if(basic_skills.map((skill)=>skill.toLowerCase()).includes(skill) || intermediate_skills.map((skill)=>skill.toLowerCase()).includes(skill) || advanced_skills.map((skill)=>skill.toLowerCase()).includes(skill))
            return {success:-1,message:"Skill already Present"}

        const skill_map={basic:0,intermediate:1,advanced:2}

        const p_id=`${this.props.index}:${skill_map[`${level}`]}`     //Parent's index

        //Add a skill locally
        let set=[...this.state[`${level}_skills`]],old=[...set]      //Initliase the set
        // console.log(position,this.state.insertPosition.index,"Add position")
        if(position===-1)                                            //Add to the end
            set.push(global_skills[index].tool)  
        else
            set.splice(position,0,global_skills[index].tool)            

        this.setState({[`${level}_skills`]:set,insertPosition:{index:-1,pos:0}})

        //Call the insert props function
          //Deepcopy props 
        let template=JSON.parse(JSON.stringify(this.props.skillModel)) //---- Contains the model for a single template

        this.makeSkill(global_skills[index],template)   //Make the skill with template
    
        if(this.props.addSkill(p_id,template,position)===0){       //If failed revert back
            this.setState({[`${level}_skills`]:old})
            return {success:-1}
        }
        else
            return {success:1}

    }

    
    displayList=()=>{
        let {innerPage:{level},insertPosition}=this.state;
        let p_id;
        let set=[];
        if(level==="")
            return
        if(level==="basic"){
            set=[...this.state.basic_skills]
            p_id=`${this.props.index}:0`
        }
        else if(level==="intermediate"){
            set=[...this.state.intermediate_skills]
            p_id=`${this.props.index}:1`
        }
        else if(level==="advanced"){
            set=[...this.state.advanced_skills]
            p_id=`${this.props.index}:2`
        }
        return(
            <React.Fragment>
                <div className="mt-4  pt-1 d-flex flex-column  align-items-center">
                    {set.map((skill,index)=>{
                       return ( 
                           <React.Fragment key={`${index}`}>
                               {/* Autocomplete to add skill above */}
                                {index===insertPosition.index && insertPosition.pos===-1?
                                    <div className="col">
                                        <Autocomplete 
                                            options={this.state.global_skills.map((skill)=>skill["tool"])}
                                            addOption={this.createSkill}
                                            addPosition={index}         //Specify the add position
                                            >
                                
                                            </Autocomplete>

                                    </div>
                                        :""
                                }

                                <div  className="col-lg col-8 mt-1 mb-1 " key={`${index}`} style={{backgroundColor:"#F5FFFA"}}>
                                    <div className="d-flex flex-row justify-content-between">
                                        <span className="pt-2 pb-2">{skill}</span>
                                        <div className="d-flex justify-content-end" >
                                            <div className="dropdown">
                                                <button className="btn " type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/more.png"/>
                                                </button>
                                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">

                                                    {/* Add a skill above */}
                                                    <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}}  onClick={()=>this.setAddPos(index,-1)}>
                                                        <span className="pl-3">
                                                            <img alt="Alt" src="http://localhost:3000/icons/plus-math.png"/>
                                                            Add skill Above
                                                        </span>
                                                    </button>


                                                    {/* Move Above button */}
                                                   {index>0?
                                                    <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}} onClick={()=>this.moveSkill(index,`${p_id}:${index}`,-1)} >
                                                        <span className="pl-3">
                                                            <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/up.png"/>
                                                            Move Up
                                                        </span>
                                                    </button>
                                                    :""
                                                    }


                                                    {/* Move down button */}
                                                    {index<set.length-1?
                                                    <button  className="btn dropdown-item " type="btn"  style={{  padding:0,border:"none"}} onClick={()=>this.moveSkill(index,`${p_id}:${index}`,+1)}>
                                                        <span className="pl-3">
                                                            <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/down.png"/>
                                                            Move down
                                                        </span>
                                                    </button>
                                                    :""
                                                    }


                                                    {/* Remove Skill button */}
                                                    <button className="btn dropdown-item " type="btn" style={{  padding:0,border:"none"}}  onClick={()=>this.deleteSkill(index,`${p_id}:${index}`)} >
                                                        <span className="pl-3">
                                                            <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/multiply.png"/>
                                                            Remove Skill
                                                        </span>  
                                                    </button>


                                                    {/* Add a skill below */}
                                                    <button className="btn dropdown-item " type="btn" style={{  padding:0,border:"none"}}  onClick={()=>this.setAddPos(index,+1)} >
                                                        <span className="pl-3">
                                                            <img alt="Alt" src="http://localhost:3000/icons/plus-math.png"/>
                                                            Add skill below
                                                        </span>  
                                                    </button>
                                                    
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                {/* To add a skill below  */}
                                {index===insertPosition.index && insertPosition.pos===1?
                                    <div className="col">
                                    <Autocomplete 
                                        options={this.state.global_skills.map((skill)=>skill["tool"])}
                                        addOption={this.createSkill}
                                        addPosition={index+1}         //Specify the add position
                                        >
                                        </Autocomplete>

                                    </div>
                                    :""
                                }
    
                            </React.Fragment>
                                )
                    })}
                </div>
            </React.Fragment>
        )
        


    }
    //Render the inner page
    displayInner=()=>{
        return(
            <React.Fragment>
                <div className="row  mt-n2 justify-content-start">
                    <div className="col offset-n2">
                        <button className="btn"  onClick={this.changeInner}><img src="http://localhost:3000/icons/undo.png"   style={{width:"22px"}}  alt="REAL"   className="img-fluid"/> </button><span className="ml-n2">Back</span>
                    </div>
                </div>

                <div className="col">
                    <Autocomplete 
                    options={this.state.global_skills.map((skill)=>skill["tool"])}
                    addOption={this.createSkill}
                    >
        
                    </Autocomplete>

                </div>
               
                {this.displayList()}
            </React.Fragment>
        )

    }
    

    displaySkills=()=>{
        let src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNNiAwbDEyIDEyLTEyIDEyeiIvPjwvc3ZnPg==" 
        if(this.state.innerPage.isInner===false){
            return(
                <div className="d-flex flex-column justify-content-start text-left align-contents-center">

                <div  className="row justify-content-between" >
                    <div className=""  onInput={(e)=>{console.log(e)}}>
                        Basic
                    </div>
                    <div>
                        <button className="btn" onClick={()=>this.changeInner('basic')}><img className="arrow" src={`${src}`}  alt="Form"></img></button>
                    </div>
                </div>

                <hr className="hr"></hr>

                <div className="row justify-content-between"  >
                    <div className=""  onInput={(e)=>{console.log(e)}}>
                        Intermediate 
                    </div>
                    <div>
                        <button className="btn" onClick={()=>this.changeInner('intermediate')}><img className="arrow" src={`${src}`}  alt="Formality" ></img></button>
                    </div>
                </div>
                
                <hr className="hr"></hr>

                <div className="row justify-content-between"  >
                    <div className=""  onInput={(e)=>{console.log(e)}}>
                        Advanced
                    </div>
                    <div>
                        <button className="btn" onClick={()=>this.changeInner('advanced')}><img className="arrow" src={`${src}`} alt="Formali"></img></button>         
                    </div>
                </div>

            </div>

            )
        }
        return this.displayInner()
    }
    

    render() {
        return ( 
            <React.Fragment>
                {this.displaySkills()}
            </React.Fragment>
         );
    }
}
 
export default Skillset;

//Down arrow --- <img src="https://img.icons8.com/android/24/000000/down.png"/>
//Up arrow --- <img src="https://img.icons8.com/ios/24/000000/up.png"/>
// Plus symbol - <img src="https://img.icons8.com/ios/24/000000/plus-math.png"/>