import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import { withRouter } from 'react-router-dom';
class LogIn extends Component {

    // componentDidMount(){
    //     console.log("Mounted Login")

    // }

    async signin(){
        let res,state,status,loginUser,redirect

        res=await fetch('http://localhost:9000/user/login',{
            method:"post",
            credentials:"include",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                username:"test",
                password:"test"

            })
        })
        status=res.status
        res=await res.json()

        loginUser=this.props.loginUser
        try{
            state=JSON.parse(this.props.location.state)
        }
        catch(e){
            state={redirect:'/'}
        }
        redirect=state.redirect
        console.log(this.props.location,"Location")
        if(status===200){
            loginUser(res.user,res.loggedin)
                this.props.history.push({
                    pathname:redirect
                })
            }

    }

    // componentWillUnmount(){
    //     console.log("Unmounted Login")
    // }

    render(){
        return(
            <div>
                <button className="btn btn-drak"
                onClick={async()=>await this.signin()}
                >
                    Sign in
                </button>
            </div>
        )
    }
}
 
export default withRouter(LogIn);