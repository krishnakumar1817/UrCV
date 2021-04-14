import React, { Component } from 'react';
class Span extends Component{
    

    render(){
        // console.log(`I'm ${this.props.index} and im a span text: `,this.props.contents);
        let classes=""
        let style={}
        if(this.props.classes!==undefined)
            classes=`${this.props.classes.join(' ')}`
        if(this.props.styles!==undefined)
            style=this.props.styles
        // let isParent
        // if(this.props.editorIndex.length>0)
        //     {  if(this.props.index.indexOf(this.props.editorIndex)===0)
        //         isParent=true
        //     else
        //         isParent=false
        //     }
        return(
            <span className={`${classes}`} style={style} id={`${this.props.index}`} >
                {this.props.contents.text}
                {this.props.children}
            </span>
        )
    }
}
export default Span