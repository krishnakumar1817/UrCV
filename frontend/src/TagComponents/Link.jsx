import React, { Component } from 'react';

class Link extends Component{
    

    render(){
        let classes=""
        let style={},href="#",target="",text="",role=""
        if(this.props.classes!==undefined)
            classes=`${this.props.classes.join(' ')}`
        if(this.props.styles!==undefined)
            style=this.props.styles
        if(this.props.contents.href!==undefined)
            href=this.props.contents.href
        if(this.props.contents.text!==undefined)
            text=this.props.contents.text
        if(this.props.contents.target!==undefined)
            target=this.props.contents.target
        if(this.props.contents.role!==undefined)
            role=this.props.contents.role
        return(
            <a className={`${classes}`} style={style} id={`${this.props.index}`} href={`${href}`} target={`${target}`} role={`${role}`}>
                {`${text}`}
                {this.props.children}
            </a>
        )
    }
}

export default Link