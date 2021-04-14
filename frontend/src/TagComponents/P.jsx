import React, { Component } from 'react';
import '../css/pHover.css'
import { Switch } from 'react-router-dom';
import {
  BrowserRouter as Router,
  Route,
  Link
} from "react-router-dom";
class P extends Component{
    

  
    showOptions(e,isParent){
        if(isParent)
        {   e.target.classList.add("pHover")
            e.target.style.backgroundColor="rgba(135, 206, 360,0.5)"
            e.target.setAttribute("data-toggle","tooltip")
            e.target.setAttribute("data-placement","bottom")
            e.target.setAttribute("title","Tooltip on bottom")
            // style={...style,"backgroundColor"}
        }
    }

    hideOptions(e,isParent){
        if(isParent)
        {   e.target.style.backgroundColor="transparent"
        }
    }

     
    
    render(){
        // console.log(`I'm ${this.props.index} and im a text :`,this.props.contents,"chidlren: ",this.props.children);
        let link=<Link to="/getEditorIndex">

                </Link>
        // console.log(Object.keys(link))
        let classes=""
        let style={}
        if(this.props.classes!==undefined)
            classes=`${this.props.classes.join(' ')}`
        if(this.props.styles!==undefined)
            style=this.props.styles
        // let isParent=this.props.index.indexOf(this.props.editorIndex)===0?true:false
        let isParent=false
        // if(this.props.editorIndex.length>0)
        //   {  if(this.props.index.indexOf(this.props.editorIndex)===0)
        //         isParent=true
        //     else
        //         isParent=false
        //   }
        // console.log(this.props.editorIndex,"And im ", this.props.index,isParent)
        // let test="<p>Tag it bitch</p>"
        return(
            <p className={`${classes}`}  style={style} id={`${this.props.index}`} ref={`${this.props.index}`}
                // onMouseEnter={(e)=>{ this.showOptions(e,isParent);
                //     console.log("Current editor is ",this.props.editorIndex)
                // }}
                // onMouseLeave={(e)=>{this.hideOptions(e,isParent)}}
                >
                {`${this.props.contents.text}`}
                {this.props.children}
            </p>
        )
    }
}

export default P