import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch
  } from "react-router-dom";
class Home extends Component {
    constructor(){
        super()
        this.state={loggedin:false}
    }
    componentDidMount(){
        console.log("Mounted Home")
    }
    componentWillUnmount(){
        console.log("Unmounted Home")
    }
    render() { 
        return ( 
            <React.Fragment>
                

            </React.Fragment>
         );
    }
}
 
export default Home;