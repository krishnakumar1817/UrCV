import React, { Component } from 'react';
import Nav from './Components/Navbar'
import { Switch } from 'react-router-dom';
import {
  BrowserRouter as Router,
  Route,
  Link
} from "react-router-dom";

class App extends Component {
  constructor(){
    super();
    this.state={user:""};
  }
  componentDidMount(){
    fetch('http://localhost:9000',{
      method:"get",
      credentials:"include"
    })
    .then(res=>res.json())
    .then(res=>{
      this.setState({user:res});
    }
    )
  }
  render() {
    return (
      <React.Fragment>
        <Nav/>


        {/* <div>
          Things that needs to be fetched here:
              1. The user details - with websites unpopulated
              2. The templates - populated 
              3. Sample websites created - populated
          Things that needs to be passed as props to Nav:
              1. User details
              
        </div> */}

      </React.Fragment>
       
    );
  }
}

export default App;
