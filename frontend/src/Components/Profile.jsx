import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import '../css/userProfile.css';
import {
    Link
  } from "react-router-dom";
class Profile extends Component {

    constructor(){
        super();
        this.state={sites:[]}
    }

    shouldComponentUpdate=(props,state)=>{
        if(this.props.loggedin===0 || this.props.loggedin===false)  //Go to home if the user has logged out
            this.props.history.push({
                pathname:'/'
            })
        return true
    }
    
    async componentDidMount(){
        
        let state,user,sites,loggedin

        // console.log("Mounted Profile");

        try{
            state=this.props.location.state
        }
        catch(e){
            window.location.href='http://localhost:300'

        }

        let {user:{websites}}=state
        let res=await Promise.all(websites.map((site)=>{
            return fetch('http://localhost:9000/website/info/'+site,{
                method:"get",
                credentials:"include"
            })

        }))
        res=await Promise.all(res.map(r=>r.json()))
        websites=res.map(site=>site.website)

        this.setState({sites:websites},()=>{
            console.log(websites)
        })


    }

    // componentWillUnmount(){
    //     console.log("Unmounted Profile")
    // }


    displayUserSites(){
        
        let {sites}=this.state,
            {user}=this.props.location.state

        return(

            <div className="mt-5">
                <div className="d-flex flex-column justify-content-around align-items-center">
                    <div className="col-lg-8 col-12 userSiteList " style={{backgroundColor:"#dfe5eb",color:"#162d3d"}}>
                        <div className="p-3 d-flex flex-row justify-content-around align-items-center">

                            <div className="col" style={{color:"#162d3d"}}>
                                <span className="col siteTableHeader" style={{color:"#162d3d"}}>
                                    Name
                                </span>
                            </div>
                            <span className="col siteTableHeader">
                                Status
                            </span>
                            <span className="col siteTableHeader">
                                Create Date
                            </span>
                            <span className="col siteTableHeader">
                                Modified Date
                            </span>
                        </div>
                    </div>

          

                    {sites.map((site,id)=>{
                        let status=site.isDeployed===true?"Published":"Not Published"
                        return (
                        <div className="col-lg-8 col-12 userSiteList " key={id}>
                            <div className="p-3 d-flex flex-row justify-content-around align-items-center">

                                <div className="col" style={{color:"#162d3d"}}>
                                    <Link className="col" to={{
                                        pathname:"/template/edit",
                                        state:{
                                            id:site._id,
                                            user:user
                                        }
                                    }}
                                    data-toggle="tooltip" data-placement="top" title="Edit Site"
                                    >
                                        <svg className="_3I4Hx _3-GML" width="40" height="40" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" ><g fill="none" fillRule="evenodd"><path d="M6 47V12a3 3 0 013-3h11.146a3 3 0 012.683 1.658l1.342 2.684A3 3 0 0026.854 15H50a4 4 0 014 4v28a4 4 0 01-4 4H10a4 4 0 01-4-4z" fill="#4EB7F5"></path><path d="M10 20h40a4 4 0 014 4v23a4 4 0 01-4 4H10a4 4 0 01-4-4V24a4 4 0 014-4z" fill="#89CFF8"></path></g></svg>
                                    </Link>
                                    <Link className="col sitePreLink" to={{
                                        pathname:"/site/preview",
                                        state:{
                                            site:site
                                        }
                                    }} 
                                    target="_blank" data-toggle="tooltip" data-placement="top" title="Preview Site"
                                    >
                                        {site.name+" "+id}
                                    </Link>
                                </div>

                                <span className="col siteTableHeader">
                                    {status}
                                </span>
                                <span className="col siteTableHeader">
                                    {site.createDate.slice(0,10)}
                                </span>
                                <span className="col siteTableHeader">
                                    {site.updateDate.slice(0,10)}
                                </span>
                                {/* <span >
                                    <img src="/icons/editArrow.png" style={{width:"35%"}}></img>
                                </span> */}
                            </div>
                        </div>
    
                        )
                    })}

                </div>
            </div>
        )


    }

    render() { 
        try{
        let {user}=this.props.location.state
        console.log(user)
        }
        catch(e){
            window.location.href='http://localhost:3000'
        }
        return ( 

            <React.Fragment>

                    <div className="pt-4 d-flex flex-row justify-content-around align-items-center intro" style={{backgroundColor:"white"}}>
                        <div className="row">
                            <div className="d-flex flex-column">
                                <p className="profileHeader">My Sites</p>
                                <p className="mt-n3">Select a site to edit, view.</p>
                            </div>
                        </div>

                        <div className="row justify-content-center align-items-center">
                            <Link to={{
                                pathname:"/template/view"
                            }}>
                            <button className="btn crBt">
                                <svg className="ml-1" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"  data-hook="prefix-icon"><path d="M12 12L12 6 11 6 11 12 5 12 5 13 11 13 11 19 12 19 12 13 18 13 18 12z"></path></svg>
                                <span className="ml-1 mr-1">Create New Site</span>
                            </button>
                            </Link>
                        </div>

                    </div>


                    <div className="mt-5 d-flex flex-xs-row justify-content-center align-items-center ml-5 mr-5 pl-5 pr-5">
                        <div className="row p-2 profileSearch">
                            <svg className="mr-2" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px"><path d="M19.8535534,19.1464466 C20.0488155,19.3417088 20.0488155,19.6582912 19.8535534,19.8535534 C19.6582912,20.0488155 19.3417088,20.0488155 19.1464466,19.8535534 L15.4380219,16.1451287 C14.1187738,17.3000688 12.3911257,18 10.5,18 C6.35786438,18 3,14.6421356 3,10.5 C3,6.35786438 6.35786438,3 10.5,3 C14.6421356,3 18,6.35786438 18,10.5 C18,12.3911257 17.3000688,14.1187738 16.1451287,15.4380219 L19.8535534,19.1464466 Z M17,10.5 C17,6.91014913 14.0898509,4 10.5,4 C6.91014913,4 4,6.91014913 4,10.5 C4,14.0898509 6.91014913,17 10.5,17 C14.0898509,17 17,14.0898509 17,10.5 Z"></path></svg>
                            <input className="pSinput" maxLength="524288" placeholder="Search for a site..." tabIndex="0" autoComplete="off" style={{textOverflow: "clip"}}
                            onFocus={(e)=>{e.target.closest(".profileSearch").style.borderColor="gray"}}
                            onBlur={(e)=>{e.target.closest(".profileSearch").style.borderColor="var(--wsr-color-30, #C1E4FE)"}}
                            />
                        </div>
                    </div>

                    {this.displayUserSites()}



            </React.Fragment>




        );
    }
}
 
export default withRouter(Profile);
