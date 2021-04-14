import React, { Component } from 'react';
import '../css/containerEditor.css'
import TextEditor from './TextEditor'
import ImgEditor from './ImgEditor'
class Container extends Component {
    constructor(props){
        super(props);
        this.state={ innerPage:{
            enabled:false,
            index:""
        } }
    }

   
    enableInner=(index)=>{
        this.setState({innerPage:{enabled:true,index}})
    }

    disableInner=()=>{
        this.setState({innerPage:{enabled:false,index:""}})

    }

    innerTree=(component,pid)=>{
        let queue=[{...component,id:pid}],editors=[]
        while(queue.length)
        {
            let cur=queue.shift();
            if(cur.tag!=="div")
            {
                editors.push(cur);
                // console.log(cur,cur.id)
                if(cur.tag==="p" || cur.tag==="span" || cur.tag==="img")
                    continue;
            }
            if(cur.children)
                for(let i=0; i<cur.children.length; i++)
                {
                    queue.push({...cur.children[i],id:`${cur.id}:${i}`});
                }

        }
        return editors

    }

    displayInner=()=>{
        let {innerPage:{index}}=this.state
        let containerIndex=`${this.props.index}:${index}`
        let innerComponent=JSON.parse(JSON.stringify(this.props.component.children[index]))
        let disp=this.innerTree(innerComponent,containerIndex)
        return(
                <React.Fragment>
                    <div className="row col mt-n2 justify-content-start">
                        <div className="col offset-n2">
                            <button className="btn"  onClick={()=>this.disableInner()}><img src="/icons/back.png"   style={{width:"22px"}}  alt="REAL"   className="img-fluid"/> </button><span className="ml-n2">Back</span>
                        </div>
                    </div>

                    <div className="mt-5 d-flex flex-column col" >
                        {disp.map((element,id)=>{
                            if(element.tag==="p" || element.tag==="span")
                                return <TextEditor key={`${id}`} text={element} 
                                        modifyText={this.props.modifyElement}
                                        index={element.id} domId={`${id}`}
                                        >

                                        </TextEditor>
                            if(element.tag==="img" || element.tag==="image")
                                return <ImgEditor key={`${id}`} img={element}
                                        index={element.id}
                                        modifyImage={this.props.modifyElement}
                                        >
                                            
                                        </ImgEditor>
                                
                        })
                        }
                    </div>
                </React.Fragment>
        )
    }

    //Remove an element at the given index -- index:tree index
    removeElement=(index)=>{
        // console.log(index)
        let res=this.props.removeElement(index)
        if(res===0)
        {   
            console.log(index)
        }
        
    }

    //Move an element at the given index by pos -- index:tree index
    moveElement=(index,pos)=>{
        // console.log(index)
        this.props.moveElement(index,pos)
    }


    //Display the list of components present in the outer container
    displayOuter=()=>{
        let components
        try{
            components=[...this.props.component.children]
        }
        catch(e){
            components=[]
        }
            let index=this.props.index
            // console.log(index)
            return( 
                <React.Fragment>
                    {/* <div className="mt-2 row">
                    <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}}  onClick={()=>this.removeElement(`${index}`)}>
                            <span className="pl-3">
                                <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/multiply.png"/>
                                    Remove 
                            </span> 
                    </button>
                    </div> */}
                    <div className="mt-4 d-flex flex-column">
                        {components.map((component,id)=>{
                            return(
                            <div key={`${id}`} className="mt-2 mb-2 pt-2 pb-2 d-flex flex-row justify-content-between align-contents-center" style={{backgroundColor:"#F5F5F5"}}
                                 onMouseEnter={()=>{let a=1;}}
                            >
                                <div className="col" 
                                     
                                     onClick={()=>{this.enableInner(id)}}
                                 >
                                    {`Container ${id}`} 
                                </div>

                                <div className="d-flex col justify-content-end" >
                                    <div className="dropdown">
                                        <button className="btn " type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/more.png"/>
                                        </button>
                                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">

                                            {/* Add a section above ----  To be added in later versions*/} 
                                            {/* <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}}  onClick={()=>this.setAddPos(index,-1)}>
                                                <span className="pl-3">
                                                    <img alt="Alt" src="http://localhost:3000/icons/plus-math.png"/>
                                                    Add skill Above
                                                </span>
                                            </button> */}

                                            {/* Remove the component */}
                                            <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}}  onClick={()=>this.removeElement(`${index}:${id}`)}>
                                                    <span className="pl-3">
                                                        <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/multiply.png"/>
                                                            Remove 
                                                    </span> 
                                            </button>

                                              {/* Move Above button */}
                                              {id>0?
                                                    <button  className="btn dropdown-item " type="btn"  style={{  padding: 0,border:"none"}} onClick={()=>this.moveElement(`${index}:${id}`,-1)} >
                                                        <span className="pl-3">
                                                            <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/up.png"/>
                                                            Move Up
                                                        </span>
                                                    </button>
                                                    :""
                                                }


                                                {/* Move down button */}
                                                {id<components.length-1?
                                                <button  className="btn dropdown-item " type="btn"  style={{  padding:0,border:"none"}} onClick={()=>this.moveElement(`${index}:${id}`,+1)}>
                                                    <span className="pl-3">
                                                        <img className="img-fluid" alt="Alt" src="http://localhost:3000/icons/down.png"/>
                                                        Move down
                                                    </span>
                                                </button>
                                                :""
                                                }


                                        </div>
                                    </div>
                                </div>
                            <hr className="hr"></hr>
                        </div>
                            )
                        })}
                    </div>
                </React.Fragment>
                
                )

    }

    render() { 
        return ( 
                <React.Fragment>
                    {this.state.innerPage.enabled===false?this.displayOuter():""}
                    {this.state.innerPage.enabled===true?this.displayInner():""}
                </React.Fragment> 
        );
    }

   
}
 
export default Container;