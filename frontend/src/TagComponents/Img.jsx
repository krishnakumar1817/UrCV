import React, { Component } from 'react';
class Img extends Component{

  
    dragStart(e){
        e.preventDefault()
        // e.dataTransfer.setData("text",e.target.src)
        // console.log(e.dataTransfer,e.target.src)
    }
    dragOver(e){
        e.preventDefault();
    }
    onDrop(e){
        e.preventDefault();
        e.target.src=e.dataTransfer.getData("text");

    }
    render(){
        // console.log(`I'm ${this.props.index} and im an image`);
        let classes=""
        let style={}
        if(this.props.classes!==undefined)
            classes=`${this.props.classes.join(' ')}`
        if(this.props.styles!==undefined)
            style=this.props.styles
        return(
            <img src={`${this.props.contents.src}`} alt="Verify" style={style} className={`${classes}`} id={`${this.props.index}`} 
                // onMouseEnter={(e)=>{
                // console.log(e.target)
                // }}
                draggable={`${true}`}
                onDragStart={(e)=>this.dragStart(e)}
                // onDragOver={(e)=>this.dragOver(e)}
                // onDrop={(e)=>this.onDrop(e)}
            >
            </img>
        )
    }
}
export default Img
