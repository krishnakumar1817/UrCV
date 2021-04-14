import { toPairs } from 'lodash-es';
import { withRouter} from 'react-router-dom'
import React, { Component } from 'react';
class Template extends Component{
    constructor(){
        super();
        this.state={html:""}
    }
    async componentDidMount(){
        console.log("Mounted Template")

        let res=await fetch('http://localhost:9000/template/html/'+this.props.template.id+'.html',{
            method:"get",
            credentials:"include"
        })
        let {status}=res
        res=await res.json()
        if(status===200)
            this.setState({html:res.html},()=>{
            })
        else
            console.log(res.log_data)
    }
    componentWillUnmount(){
        console.log("Unmounted Template")
    }
    loadingPage(){
        let element=document.getElementById("loadingPage")
        element.style.display="block"
        element.style.height="100%"
        let root=document.getElementById("root")
        root.style.display="none"
        
        setTimeout(()=>{
            element.style.display="none"
            root.style.display="block"
        },3000)
    }

    async createSite(){
        let {user,loggedin,template:{_id}}=this.props
        if(this.props.loggedin===0 || this.props.loggedin===false)
            {
                this.props.history.push({
                    pathname:'/user/login',
                    state:JSON.stringify({
                        redirect:this.props.history.location.pathname,
                    })
                })
                return
            }
        
        let site=await fetch('http://localhost:9000/website/create',{
            method:"POST",
            credentials:"include",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                username:user.username,
                id:_id
            })
        })
        site=await site.json()
        user=site.user
        this.props.updateUser(user)

        let site_id=site.website_id
        this.props.history.push({
            pathname:'/template/edit',
            state:{
                id:site_id,
                user:user
            }
        })
        
    }
    render(){
        if(this.state.html.length>0)
            return <div  className="col-lg-6 col-12 outerTemplate" 
                    >
                        <div  className="viewTemplate embed-responsive embed-responsive-21by9 mt-3 mb-3"
                        // to={to} 
                        onClick={async()=>{await this.createSite()}}
                        onMouseLeave={(e)=>{e.target.scrollTop=0}}
                        >   
                            <div dangerouslySetInnerHTML={{__html:this.state.html}} className="embed-responsive-item itemTemplate">
                                
                            </div>
                          
                        </div>
                        {/* <div className="itemTemplateDesc pt-4 align-items-center justify-content-center">
                                {this.props.template.name}
                        </div> */}
                    </div>

        return <div></div>
    }
}

export default withRouter(Template);