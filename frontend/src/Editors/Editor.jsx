import React, { Component } from 'react';
import SkillsEditor from './SkillsEditor'
import MenuEditor from './MenuEditor'
import ContainerEditor from './ContainerEditor'
import '../css/Editor.css'
class Editor extends Component {
    constructor(){
        super()
        this.state={owner:""}
    }


    setOwner=()=>{
        if(this.props.type==='skills'){
            return 'SKILLS'
        }
        else if(this.props.type==='container')
        {
            return 'CONTAINER'
        }
        else if(this.props.type==='menu'){
            return 'MENU'
        }

    }


    displayEditor=()=>{
        if(this.props.type==='skills'){
            return(
                <SkillsEditor component={this.props.component} 
                              index={this.props.index} 
                              removeSkill={this.props.delete}
                              moveSkill={this.props.move}
                              addSkill={this.props.insert}
                              skillModel={this.props.models.skillTemplate}
                >
                    
                </SkillsEditor>
            )
        }

        else if(this.props.type==='container')
        {
                return(
                    <ContainerEditor key={`${this.props.index}`}
                                    component={this.props.component} 
                                     index={this.props.index} 
                                     removeElement={this.props.delete}
                                     moveElement={this.props.move}
                                     modifyElement={this.props.modify}
                                     >
                        
                    </ContainerEditor>
                )
                }
        else if(this.props.type==='menu'){
                    return(
                        <MenuEditor>

                        </MenuEditor>
                    )
        }

    }


    removeElement=(index)=>{
            this.props.delete(index)
    }

    moveElement=(index,pos)=>{
        this.props.move(index,pos)
    }



    render() { 
        let {index}=this.props
        let owner=this.setOwner()
        return ( 
            <React.Fragment>
                <div className="d-flex flex-column  header" >
                    <div className="mt-5  row justify-content-between" style={{}}>
                        <div className="offset-1 monospace font-weight-bold">
                            {owner}
                        </div>
                        <div className="font-weight-bold">
                            <button type="button" className="close" aria-label="Close"  onClick={()=>this.props.disableEditor()} style={{marginLeft:""}}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="d-flex col justify-content-end" >
                            <div className="dropdown">
                                <button className="btn " type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/more.png"/>
                                </button>
                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">

                                    {/* Remove the component */}
                                    <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}}  onClick={()=>this.removeElement(`${index}`)}>
                                            <span className="pl-3">
                                                <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/multiply.png"/>
                                                    Remove 
                                            </span> 
                                    </button>
                                    <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}} >
                                        <span className="pl-3">
                                            <img alt="Alt" src="http://localhost:3000/icons/plus-math.png"/>
                                            Add skill Above
                                        </span>
                                    </button>

                                    <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}}>
                                        <span className="pl-3">
                                            <img alt="Alt" src="http://localhost:3000/icons/plus-math.png"/>
                                            Add skill Below
                                        </span>
                                    </button>


                                    <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}} onClick={()=>this.moveElement(`${index}`,-1)} >
                                        <span className="pl-3">
                                            <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/up.png"/>
                                            Move Up
                                        </span>
                                    </button>

                                    <button  className="btn dropdown-item " type="btn"  style={{  padding:0,border:"none"}} onClick={()=>this.moveElement(`${index}`,+1)}>
                                        <span className="pl-3">
                                            <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/down.png"/>
                                            Move down
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-5 pt-2">
                         {this.displayEditor()}
                </div>
            </React.Fragment>
         );
    }
}
 
export default Editor;