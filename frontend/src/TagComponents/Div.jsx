import React, { Component } from 'react';
import '../css/editPanel.css'
class Div extends Component{

    //Check if the next selected component is same as the existing component
    //Performance Improvance
    shouldComponentUpdate(nextProps,nextState){

        let {index,editorIndex}=this.props;
        let next_editorIndex=nextProps.editorIndex;

        //If the container is not a top level component

        //The parent component of the selected component
        if(editorIndex===index && nextProps.editorIndex!==editorIndex)
                        {
                            let comp=document.getElementById("oly:"+index)
                            comp.classList.remove('selected')
                            // comp.classList.remove('editPanel')
                        }
        
        //Commented for now since the editor option doesn't show the result immediately.....
        //Don't try to optimize the performace...the pipeline and the structure is messed up....Sikes

        // if(editorIndex.length>0 && next_editorIndex.length===0)  //editor closed - from an open state----No need to render
        //     return 0;

        // if(editorIndex.length===0 && index.indexOf(nextProps.editorIndex)===0) //Editor opened -- render only the editor enabled component
        //     return 1;
        
        // // Render the editor enabled component -- found in nextProps.editor
        // if((index.indexOf(editorIndex)===0 && editorIndex===next_editorIndex)|| index.indexOf(nextProps.editorIndex)===0) 
        //     return 1;
        
        // // Render the component edited in undo or redo operation 
        // if((index.indexOf(nextProps.undoIndex)===0 && nextProps.undoIndex.length>0)|| (index.indexOf(nextProps.redoIndex)===0) && nextProps.redoIndex.length>0 )
        //     return 1;
        
        // if(editorIndex.length===0 && index.indexOf(nextProps.editorIndex)!==0) //Do not render otherwise
        //     return 0;
                        
        return 1;  //Do not render otherwise
    }

    displayOverlayButtons=(ind)=>{
        // let up= <div id="addAboveButton" style={{position:"absolute", top:"0%", right:"50%", left:"50%",bottom:"100%"}}>
        //             <img src="https://img.icons8.com/cotton/64/000000/plus--v1.png"/>
        //         </div>
        // let down=<div id="addBelowButton" style={{position:"absolute", bottom:"0%", right:"50%", left:"50%",top:"100%"}}>
        //             <img src="https://img.icons8.com/cotton/64/000000/plus--v1.png"/>
        //         </div>
        let commonImg=document.createElement("img");
        commonImg.setAttribute("src","https://img.icons8.com/cotton/64/000000/plus--v1.png");

        let Img=document.createElement("img");
        Img.setAttribute("src","https://img.icons8.com/cotton/64/000000/plus--v1.png");

        let divtop=document.createElement("div");
        divtop.style.cssText="position: absolute;  top:-5%;  right:50%;  left:50%;"
        divtop.appendChild(Img);
        divtop.setAttribute("id","addAboveButton");

        let divbottom=document.createElement("div");
        divbottom.style.cssText="position: absolute;  bottom:-5%;  right:50%;  left:50%;"
        divbottom.appendChild(commonImg);
        divbottom.setAttribute("id","addBelowButton");

        let moreImg=document.createElement("img");
        moreImg.setAttribute("src","https://img.icons8.com/ios/24/000000/more.png");

        let divEnd=document.createElement("div");
        divEnd.style.cssText="position: absolute;  top:0%;  right:1%; "
        divEnd.appendChild(moreImg);
        divEnd.setAttribute("id","addEndButton");


        document.getElementById(ind).append(divtop,divbottom,divEnd);

    }

    removeOverlayButtons=(ind)=>{

        let up=document.getElementById("addAboveButton");
        let down=document.getElementById("addBelowButton");
        let end=document.getElementById("addEndButton");
        try{
        document.getElementById(ind).removeChild(up);
        document.getElementById(ind).removeChild(down);
        document.getElementById(ind).removeChild(end);
        }
        catch(e){
            // console.log()
        }
    }
    
    render(){
        // if(this.props.editorIndex!=="")
        // console.log("Im getting rendered",this.props.index)
        let classes=""
        let style={}
        if(this.props.classes!==undefined)
            classes=`${this.props.classes.join(' ')}`
        if(this.props.styles!==undefined)
            style=this.props.styles
        let parent=this.props.index.split(':')[0]

        if(this.props.index.includes(":")){
            return(
                <div className={`${classes}`} id={`${this.props.index}`}style={style}>
                        {this.props.children}
                </div>
            )   
        }
        let disabled=this.props.index===0?`disabled`:""
        classes=`divs ${classes}`
        
        return(
        // Overlay component with index of the given form contains the div in uniformed size divs
        <div style={{width:"auto", display:"block", position:"relative"}} id={`oly:${this.props.index}`}
        onMouseEnter={()=>{
                    
            if(this.props.editorIndex===parent)
                return

            let comp=document.getElementById("oly:"+this.props.index)
            comp.classList.add('overlay')
            // document.getElementById("eoly:"+this.props.index).style.display="block"
            // this.displayOverlayButtons("oly:"+this.props.index);

        }}
        onMouseLeave={()=>{
                    
            let comp=document.getElementById("oly:"+this.props.index)
            comp.classList.remove('overlay')
            // document.getElementById("eoly:"+this.props.index).style.display="none"
        }}
        >   
            <div className={`${classes}`} id={`${this.props.index}`}  

                onClick={()=>{

                    //If editor is already enabled return
                    if(this.props.editorIndex===parent)
                        return

                    this.props.enableEditor(this.props.index,classes)
                    let comp=document.getElementById("oly:"+this.props.index)
                    comp.classList.add('selected')
                    // comp.classList.add('editPanel')

                }} style={{...style}}>
               
                {this.props.children}
            </div>

            {/* <div id={`eoly:${this.props.index}`} style={{display:"none",width:"auto",zIndex:"-1"}}>
               <button style={{top:"0%", right:"50%", position:"absolute"}} className="btn">
                   <img src="/icons/plus-add.png"></img>

               </button>
               <button style={{bottom:"0%", right:"50%", position:"absolute"}} className="btn">
                   <img src="/icons/plus-add.png"></img>

               </button>
            </div> */}
        </div>

        )
    }
}

export default Div
