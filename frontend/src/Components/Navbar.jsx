import React,{Component, useRef} from 'react';
import { withRouter } from 'react-router-dom'
import '../css/navbar.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import TemplateEditor from '../Templates/templateEditor';
import Home from './Home';
import LogIn from './LogIn';
import Templates from './Templates';
import Profile from './Profile';
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch
  } from "react-router-dom";
import { Redirect } from "react-router-dom";
 
// class Git extends Component{
//     constructor(){
//         super();
//         this.state={response:""}
//     }
//     componentDidMount=async()=>{
//         let keys=await fetch(`https://github.com/login/oauth/authorize?client_id=${}`);
//         let key=await keys.json();
//         fetch('http://localhost:9000/gitauth')
//         .then(res=>res.json())
//         .then(res=>{
//             console.log(res);
//             this.setState({response:res});
//         })
//     }
// }
class Navbar extends Component {
    constructor(){
        super()
        this.state={loggedin:false,user:{},templates:[]}
        this.loginUser=this.loginUser.bind(this)
        this.logoutUser=this.logoutUser.bind(this)
    }

    //Initial rendering to see if the user is already logged in
    async componentDidMount(){
        let btn=document.getElementById("publishBtn")           //Remove P
        if(btn)
            btn.remove()

        let res=await fetch('http://localhost:9000/',{
            method:"GET",
            credentials:"include"
        })
        res=await res.json()
        this.setState({...res},()=>{
        })
    }

    // componentWillUnmount(){
    //     console.log("Unmounted Nav")
    // }
    // componentWillUnmount(){
    //     console.log("Unmounted Nav")
    // }

    //Log in a user
    loginUser(user,loggedin){

        this.setState({user,loggedin},()=>{
            return true
        })

    }

    //To logout a user
    async logoutUser(){
        let res=await fetch('http://localhost:9000/user/logout',{
            method:"post",
            credentials:"include"
        })
        res=await res.json()
        this.setState({loggedin:false,user:{}})
        
    }

    updateUser=(user)=>{
        this.setState({user:user},()=>{
            console.log("Called")

        })
    }

    userMenu(){
        if(!this.state.loggedin)
           return <li  className="nav-item ml-auto" >
                  <Link className="nav-link" to={{
                      pathname:"/user/login",
                      state:{
                          params:{
                            redirect:window.location.href
                          }
                      }
                  }}>
                            <button className="btn" style={{backgroundColor:"#45b29a", color:"white"}}>
                                Sign in
                            </button>
                      </Link> 
                </li>
             
        
        return <React.Fragment>
               <li  className="nav-item"> 
                        <Link className="nav-link" to={{
                            pathname:'/user/profile',
                            state:{
                                user:this.state.user
                            }
                        }}>
                            Your Sites
                        </Link>
                </li>
                <li  className="nav-item" style={{left:"100%"}}>        
                    <div className="dropdown show">
                    <a className="btn btn-secondary" href="#" role="button" id="userMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{border:"none",background:"none"}}>
                        <img src="/icons/userIcon.png" style={{width:"32px", heigh:"10px"}}></img>
                    </a>
                    <div className="dropdown-menu " aria-labelledby="userMenu" id="menu">
                        <Link className="dropdown-item col mr-2" to={{
                                            pathname:"/user/profile",
                                            state:{
                                                user:this.state.user
                                            }
                                        }}>
                            <svg viewBox="0 0 24 24" width="1em" height="1em" className="mr-3"><path fillRule="evenodd" d="M17 3c1.1 0 2 .9 2 2v16l-7-3-7 3 .01-16c0-1.1.89-2 1.99-2h10zm-5 10.43L14.472 15l-.656-2.96L16 10.048l-2.876-.256L12 7l-1.124 2.792L8 10.048l2.184 1.992L9.528 15 12 13.43z"></path>
                            </svg>
                        {this.state.user.username}
                        </Link>
                        <a className="dropdown-item col" onClick={async()=>await this.logoutUser()}  >
                        <svg viewBox="0 0 24 24" width="1em" height="1em" className="mr-3"><path fillRule="evenodd" d="M21 3.01a2 2 0 0 1 2 2v14c0 1.1-.9 1.98-2 1.98H10c-1.1 0-2-.88-2-1.98V15h2v4.02h11V4.99H10V9H8V5.01c0-1.1.9-2 2-2h11zM5 16l-4-4 4-4v3h10v2H5v3z"></path></svg>
                        Sign out</a> 
                    </div>
                </div>
                </li>
                </React.Fragment>  
    }
   
    isloggedin(){
        if(this.props.user.loggedin===true)
            return <Link className="nav-link" to="/user/profile">Loggedin</Link>
        else
            return <Link className="nav-link" to="/user/login">Log In</Link>

    }

    render() { 
        return ( 
            <React.Fragment>
                <Router>
                    <nav className="navbar navbar-expand-lg navbar-light  sticky-top navMenu" id="navBarSite" style={{backgroundColor:"white", fontSize:"110%"}}>
                        <Link className="navbar-brand"  to="/" >
                            UrCV    
                        </Link>
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        {/* Additional links are added here */}
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav align-items-center">
                                <li className="nav-item">
                                    <Link  className="nav-link" to={{
                                        pathname:'/template/view',
                                    }}>Design</Link>   
                                </li>
                                {this.userMenu()}
                            </ul>
                        </div>

                    </nav>
                    <Switch>
                        <Route exact path='/' component={Home}></Route>
                        <Route exact path="/user/login" component={()=><LogIn loginUser={this.loginUser}></LogIn>}></Route>
                        <Route exact path="/user/profile" component={()=><Profile loggedin={this.state.loggedin}></Profile>}></Route>
                        <Route exact path='/template/view' component={()=><Templates templates={this.state.templates} user={this.state.user} loggedin={this.state.loggedin} updateUser={this.updateUser} loginUser={this.loginUser}></Templates>}></Route>
                        <Route exact path='/template/edit' component={()=><TemplateEditor loggedin={this.state.loggedin}></TemplateEditor>}></Route>
                        {/* <Route exact path='/site/preview' component={()=>}></Route> */}
                    </Switch>
                </Router>
            </React.Fragment>
         );
    }
}

 
export default Navbar;