import { toPairs } from 'lodash-es';
import React, { Component } from 'react';
import {
    Link,
  } from "react-router-dom";
import Template from './Template.jsx'
import '../css/viewTemplates.css'

class Templates extends Component {
    componentDidMount(){
        console.log("Mounted Templates")

    }
    componentWillUnmount(){
        console.log("Unmounted Templates")
    }
    render() { 
        let {templates}=this.props
        
        return (
            <React.Fragment>
                <div className="mt-3 d-flex flex-lg-row flex-col flex-wrap m-4 itemContainer justify-content-center">
                    {templates.map((template,id)=>{
                       return <Template template={template} key={id} 
                               loggedin={this.props.loggedin} user={this.props.user}
                               updateUser={this.props.updateUser}
                              history={this.props.history} 
                       ></Template>
                    })}
                </div>
                
            </React.Fragment>
          );
    }
}


 
export default Templates;