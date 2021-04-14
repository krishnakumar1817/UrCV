import React, { Component } from 'react';
class MenuEdit extends Component {
    constructor(){
        super();
        this.state={Menu:[],active:false}
    }
    componentDidMount(){
        this.setState({Menu:this.props.menu})
    }
    render() { 
        return (  
            <React.Fragment>
                {this.state.Menu.map((menu,index)=>{
                    return (<li key={index} className="nav-item">
								<a style={{color:"white"}} className="nav-link" href={menu.href}>{menu.title}</a>
                            </li>)
                })}
            </React.Fragment>
        );
    }
}
 
export default MenuEdit;