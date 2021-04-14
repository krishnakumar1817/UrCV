import React, { Component } from 'react';
import '../css/autocomplete.css'
class Node{
    constructor(value,index=-1){
        this.index=index
        this.isEnd=false
        if(index!==-1)
            this.isEnd=true
        this.value=value
        this.children=[];
    }

    addIndex(index){
        this.index=index
        this.isEnd=true

    }

}

class Trie{
    constructor(options=undefined){
        this.root=new Node("")
        if(options)
            this.construct(options);
    }

    construct(options){
        options.forEach((option,index)=>this.add(option,index))
    }

    asciimap(character){
        let value=character.charCodeAt(0)
        if(value>=97 && value<=122)
            return value-'a'.charCodeAt(0)
        if(value>=48 && value<=57)
            return value-22
        let ascii={
                32:36,          //' '
                35:37,          //'#'
                43:38,          //'+'
                45:39,          //'-'
                46:40,          //'.'
                47:41,          //'/'
                92:42,          //'\'
            }
        return ascii[value];
         
    }

    add(string,index){
        let len=string.length;
        let parent=this.root;
        string=string.toLowerCase();
        for(let i=0; i<len; i++){
            let id=this.asciimap(string[i])
            if(!parent.children[id]){
                if(i===len-1){
                    parent.children[id]=new Node(string[i],index)
                }
                else
                    parent.children[id]=new Node(string[i])
            }
            if(i===len-1){
                parent.children[id].addIndex(index)
            }
            parent=parent.children[id]

        }
    }

    search(prefix){
        prefix=prefix.toLowerCase()
        let root=this.root,len=prefix.length
        for(let i=0; i<len; i++){
            let id=this.asciimap(prefix[i])
            if(root.children[id])
                {
                    root=root.children[id]
                    if(i===len-1)
                        return root;
                    continue;
                }
        }
        return undefined
    }


     recurse(root,prefix,string,strings){
        if(root===undefined)
            return
         if(root.children.length===0 )
            {
                string+=`${root.value}`
                string=`${prefix}${string}`
                strings.push({string,index:root.index})
                return
            }

        if(root.isEnd===true){
            strings.push({string:`${prefix}${string}${root.value}`,index:root.index})

        }

        for(let i=0; i<root.children.length; i++)
            if(root.children[i])
                this.recurse(root.children[i],prefix,string+`${root.value}`,strings)
         
    }


    retrieve(prefix){
        let root=this.search(prefix)
        prefix=prefix.toLowerCase().slice(0,prefix.length-1)
        let strings=[]
        this.recurse(root,prefix,"",strings)
        return strings


    }


}


class Autocomplete extends Component {
    constructor(props){
        super(props);
        this.state={filtered_list:[],
                    active:false,                            //True - search active
                    active_index:0,                          //Index of the active item
                    input:"",                                //input value
                    input_length:0,                          //length of keyboard input
                    trie:new Trie(this.props.options),       //trie of options
                    errMessage:""                            //Display err messages
                   }      
    }


    changeInput(e){
        // console.log(e.target.value)
        let filtered_list=this.state.trie.retrieve(e.target.value)
        filtered_list=filtered_list.slice(0,Math.min(filtered_list.length,7))
        this.setState({input:e.target.value,
                      active:true,
                      active_index:0,
                      filtered_list,
                      input_length:e.target.value.length,
                      errMessage:""})
    }


    selectOption(e){
        const {active_index,filtered_list,active}=this.state;
        let ai;
        let string=filtered_list[active_index]!==undefined?filtered_list[active_index].string:""
        if(e.keyCode===13 && active===true){
            this.setState({
                active_index:0,
                input:filtered_list[active_index].string,
                filtered_list:[],
                active:false,
            })

        let status
        if(this.props.addPosition===undefined)
            status=this.props.addOption(filtered_list[active_index].index)
        else{
            status=this.props.addOption(filtered_list[active_index].index,this.props.addPosition)
        }

        if(status.success===-1){
            // console.log(status.message)
            this.setState({errMessage:status.message})
        }

            // console.log("The selected index",filtered_list[active_index].index)
        }
        else if(e.keyCode===38 && active===true){
            
            if(active_index===0)
                ai=filtered_list.length-1;
            else
                ai=active_index-1
            this.setState({
                active_index:ai,
                input:filtered_list[ai].string,
                active:true,
            })
        }
        else if(e.keyCode===40 && active===true){
            if(active_index===filtered_list.length-1)
                ai=0;
            else
                ai=active_index+1;
            this.setState({
                active_index:ai,
                input:filtered_list[ai].string,
                active:true,
            })
        }

    }


    clickOption(e,index){
        let text=e.target.innerText
        // console.log("The select index",index)
        this.setState({
            active_index:0,
            input:text,
            active:false,
            filtered_list:[]
        })

        let status

        if(!this.props.addPosition)
            status=this.props.addOption(index)
        else
            status=this.props.addOption(index,this.props.addPosition)
        
        if(status.success===-1){
            // console.log(status.message)
            this.setState({errMessage:status.message})

        }


    }


    hoverEnter(e,index){
        let {filtered_list}=this.state;
        let input=filtered_list[index].string;
        this.setState({
            active_index:index,
            input
        })

    }


    displayMatches(){
        if(this.state.active)
        {
            const {filtered_list,active_index,input_length}=this.state;
            return(
                <React.Fragment>
                    <div className="d-flex flex-column">
                    {filtered_list.map((skill,index)=>{
                        let active_class=""
                        if(active_index===index){
                            active_class="active-item"
                        }
                        // let prefix_index=skill.string.indexOf(input);
                        let prefix=skill.string.slice(0,input_length);
                        let suffix=skill.string.slice(input_length,skill.string.length);
                        // console.log(prefix,suffix)
                        return(
                            <div className="col" 
                                 key={`${index}`}
                                 onClick={(e)=>this.clickOption(e,skill.index)}
                                 onMouseEnter={(e)=>this.hoverEnter(e,index)}
                                 
                            >
                                <div className={`${active_class}`}>
                                    {prefix}<span className="font-weight-bold">{suffix}</span>
                                    {/* {skill.string} */}
                                </div>
                            </div>
                        )
                    })}
                    </div>
                </React.Fragment>
            )
        }
        
    }

    
    render(){
        let {errMessage}=this.state;
        return(
            <React.Fragment>
                <div className="d-flex flex-column">
                    <div className="flex justify-content-center">
                        <input autoComplete="off" type="search-box" id="skill-search" className="form-control mb-2 mt-2 shadow-sm" placeholder="Add a language, framework, database.."
                        value={`${this.state.input}`}
                        onChange={(e)=>this.changeInput(e)}
                        onKeyDown={(e)=>this.selectOption(e)}
                        >
                        </input>
                    </div>

                    {errMessage.length>0?
                    <div className="text-danger justify-content-center">
                        {errMessage}
                    </div>
                    :""
                    }

                    {this.displayMatches()}
                </div>
            </React.Fragment>
        )
    }
}
 
export default Autocomplete;