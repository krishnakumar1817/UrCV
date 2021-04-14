import React, { Component } from 'react';
import '../css/TextEditor.css'
import fonts from '../jsonFiles/bestFonts.json'
import { debounce , throttle , isEqual} from 'lodash'

class TextEditor extends Component {

    constructor(props){
        super(props);
        this.state={
            defaultStyles:{fontWeight:"normal", fontStyle:"normal", textDecoration:"none", fontFamily:"Alice",color:"#333333"},
            editStyles:{fontWeight:"bold", fontStyle:"italic", textDecoration:"underline",
            color:['#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF', '#333333', '#808080', '#cccccc', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF', '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00', '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E']},
            test:0,
            debouceChange:throttle(this.updateParent,692),
            text:this.props.text,
            prevText:undefined,
            undo_stack:[],
            redo_stack:[],
            stateChange:true,
            z:false,
            y:false
            // debouceChange:this.updateParent

        }
    }


    componentDidMount(){

        let prevText=document.getElementById("editorTextKey"+this.props.domId).children[0]
        this.setState({prevText:prevText.cloneNode(true)})

    }
    //Completely avoid re-rendering the component(Allow rendring only after component mounts)
    shouldComponentUpdate=(nextProps,nextState)=>{
        return false; 
    }

    // Group the nested sentences along with the styles
    groupTextStyles=(Text,sentence)=>{

        let arr=[Text]
        if(Text.children)
            arr=[Text,...Text.children]

        for(let i=0; i<arr.length; i++)
        {   
            let child=arr[i]
            if(child.tag==="br"){
                sentence.push({tag:"br"});
                continue;
            }
            if(child.contents.text.length===0 && i===0)
                continue;
                if(child.styles){
                    if("fontSize" in child.styles)
                        child.styles["fontSize"]="100%"
                    else
                        child.styles={...child.styles, fontSize:"100%"}
                    sentence.push({text:child.contents.text, style:child.styles})
                }
                else
                    sentence.push({text:child.contents.text, style:{fontSize:"100%"}})
        }

    }

    //Set the values of the style editor attributes of the corresponding textbox
    setStyleEditor=()=>{

        let Style={...this.state.defaultStyles},
        Selection=document.getSelection(),
        {anchorNode,focusNode, anchorOffset, focusOffset}=Selection,
        ancParent=anchorNode.parentNode, focParent=focusNode.parentNode,
        parentEditor=ancParent.parentNode.parentNode.previousSibling,
        isSingleChar=(ancParent===focParent && anchorOffset===focusOffset), styleAttributes

        try{
            styleAttributes=parentEditor.querySelectorAll(".styleAtb")
        }
        catch(e)
        {
            return;
        }
        let arr=Object.entries(Style), i=0

        if(ancParent.tagName==="SPAN" && isSingleChar)
        {
           
            for(i=0; i<3; i++){
                if(arr[i][1]!==ancParent.style[arr[i][0]] && ancParent.style[arr[i][0]].length>0)
                        styleAttributes[i].style['backgroundColor']="#87ccaa"
                else
                    styleAttributes[i].style['backgroundColor']="#FFFFFF"
            }
   
        }

        if(ancParent.tagName==="SPAN" && focParent.tagName==="SPAN")
            for(i=3; i<arr.length ;i++){
                if(arr[i][0]!=="color"){
                    let val=ancParent.style[arr[i][0]]

                    if(val[0]==='"')
                            val=val.slice(1,val.length-1)

                    if(val.length>6){
                        val=val.slice(0,6)
                        val+=".."
                    }
                    if(ancParent===focParent)
                        styleAttributes[i].innerText=val
                    else
                        styleAttributes[i].innerText="      "

                    styleAttributes[i].setAttribute("title",ancParent.style[arr[i][0]])
            }

            }
      
    }

    updateParent=(targetChild)=>{
        let propText=this.props.text

        let propClass=propText.classlist, propStyle=propText.styles;
        if(propStyle===undefined || propStyle===null)
            propStyle={}
        let textComponent={
            tag:"p",
            classlist:propClass,
            styles:JSON.parse(JSON.stringify(propStyle)),
            contents:{text:""},
            children:[]
        }        

        let spanTexts
        try{
        spanTexts=targetChild.children;
        }
        catch(e){
            textComponent.children.push(
                {
                    tag:"span",
                    classlist:[],
                    styles:{},
                    contents:{text:``},
                    children:[]   
                }
                )
            return 
            
        }
        for(let span of spanTexts)
        {      
            if(span.tagName==="BR")
                {
                    textComponent.children.push(
                        {
                            tag:"br",classlist:[],styles:{},contents:{},children:[]   
                        }
                        ) 
                    continue
                }
            let spanStyle=[], spanObj={}
            try{
                spanStyle=span.style.cssText.slice(0,-1).split("; ")
                }
                catch(e)
                {}
            if(span.style.cssText.length>0)
                for(let style of spanStyle)
                {   let key = style.split(":")[0],val=style.split(":")[1]
                    while(val[0]===" ")
                        val=val.slice(1)
                    if(key.length===0 || val.length===0)  
                        continue
                    spanObj={
                        [key]:val,
                        ...spanObj
                    }
                }            
            textComponent.children.push({
                    tag:"span",
                    classlist:[],
                    styles:spanObj,
                    contents:{text:`${span.innerText}`},
                    children:[]   
                }
            )  
        }
        let undo_stack=[...this.state.undo_stack],
            redo_stack=[...this.state.redo_stack]
        undo_stack.push({
            "undo":this.state.prevText,
            "redo":targetChild.cloneNode(true)
                }
            )
        // console.log("Change:",targetChild.cloneNode(true))

        this.setState({undo_stack,redo_stack,prevText:targetChild.cloneNode(true)},()=>{
            this.props.modifyText(this.props.index,textComponent)
        })  //Update the undo and redo stack
    }


    setFocus=(Selection, element, offset=0)=>{

        let range=document.createRange()
            range.setStart(element,offset)
            range.setEnd(element,offset)
            Selection.removeAllRanges();
            Selection.addRange(range)

    }


    
    //Function to respond to changes in the Text
    //Under construction
    onChange=(e)=>{

        if(e.ctrlKey && e.which === 90 && e.type==="keyup"){
            e.preventDefault();
            let undo_stack=[...this.state.undo_stack]
            let redo_stack=[...this.state.redo_stack]
            if(undo_stack.length===0){
                return
            }
            let top=undo_stack.pop();
            redo_stack.push(top);
            top=top["undo"]
            document.getElementById("editorTextKey"+this.props.domId).innerHTML=''
            document.getElementById("editorTextKey"+this.props.domId).append(top)
            this.setState({text:top,undo_stack,redo_stack,stateChange:!this.state.stateChange,z:true})
            return
        }
        else if(e.ctrlKey && e.which === 90 && e.type==="keydown")
            return

        if(e.which === 90 && this.state.z===true){
            this.setState({z:false})
            return
        }

        if(e.ctrlKey && e.which === 89 && e.type==="keyup"){
            e.preventDefault();
            let undo_stack=[...this.state.undo_stack]
            let redo_stack=[...this.state.redo_stack]
            if(redo_stack.length===0){
                return
            }
            let top=redo_stack.pop();
            undo_stack.push(top);
            top=top["redo"]
            document.getElementById("editorTextKey"+this.props.domId).innerHTML=''
            document.getElementById("editorTextKey"+this.props.domId).append(top)
            this.setState({text:top,undo_stack,redo_stack,stateChange:!this.state.stateChange,y:true})
            return
        }

        else if(e.ctrlKey && e.which === 89 && e.type==="keydown")
            return

        if(e.which === 89 && this.state.y===true){
                this.setState({y:false})
                return
            }
        if(e.which===17){
            // console.log("Ctrl down")
            return
        }
        let targetChild=e.target.children[0],   //Parent Paragraph of the editable text
            Selection=document.getSelection(),   //Selection object
            {anchorNode,focusNode, anchorOffset, focusOffset}=Selection,
            ancParent=anchorNode.parentNode, focParent=focusNode.parentNode,
            Styles=this.state.defaultStyles      //Default Style Object

        if(e.which===13 && e.type==="keydown")   //Handle enter keydown event
        {   
            e.preventDefault();
            return
        }

        //Handle keyup event on enter -- add empty span and focus on the empty span
        if(e.which===13 && e.type==="keyup")
        {   
            e.preventDefault();  //Prevent default action on enter

            //Create an empty span and attach it to the target child
            let emptySpan=document.createElement('span')
            
            for(let [key,value] of Object.entries(Styles))  //Initialise style properties with the state stored values
                emptySpan.style[key]=value

            emptySpan.style.fontSize="100%"
            emptySpan.classList.add("editorText")

            if(ancParent===focParent && ancParent.tagName==="SPAN")  //Same span element
            {

                    if(focusOffset<anchorOffset)
                        [focusOffset, anchorOffset]=[anchorOffset, focusOffset]

                    let parentIndex=[...targetChild.children].indexOf(ancParent),
                        textLength=anchorNode.textContent.length,                 //Length of the span element
                        spanText, anchorText,                                     //Text inside replacing span and replaced span
                        isFullText=(focusOffset-anchorOffset===textLength && focusOffset!==anchorOffset) //If entrie span is selected

                    spanText=anchorNode.textContent.slice(focusOffset,textLength)  
                    anchorText=anchorNode.textContent.slice(0,anchorOffset)

                    if(focusOffset===textLength && !isFullText)                                 //If caret after end of span
                        if(ancParent.nextSibling===null || ancParent.nextSibling.tagName==="BR")
                                spanText="&#65279;"

                    else if(anchorOffset===0 || isFullText===true)                                  //If caret before beginning of span
                        anchorText="&#65279;" 

                    emptySpan.innerHTML=spanText                                  //Split the span element
                    if(focusOffset<textLength)
                        emptySpan.style.cssText=ancParent.style.cssText               //Set the style 

                    ancParent.innerHTML=anchorText

                    if(ancParent.nextSibling===null || ancParent.nextSibling.tagName!=="BR" || !isFullText)   //TO avoid consecutive br elements
                        targetChild.insertBefore(document.createElement("br"),targetChild.children[parentIndex+1])  //Add br after the replaced span
                    

                    if(spanText.length>0 && !isFullText)                                         //If replacing span non empty
                       { targetChild.insertBefore(emptySpan,targetChild.children[parentIndex+2])
                          this.setFocus(Selection,emptySpan)
                       }
                    else
                        this.setFocus(Selection,ancParent.nextSibling.nextSibling)  //Set focus on element after br(node+2)                    
            }

            else if(ancParent.tagName==="SPAN" && focParent.tagName==="SPAN"){   //If more than one span elements are selected

                let ancIndex=[...targetChild.children].indexOf(ancParent),
                    focIndex=[...targetChild.children].indexOf(focParent)

                if(focIndex<ancIndex)         //Swap all the properties of focus and anchor node
                    [ancParent,focParent,anchorOffset,focusOffset,ancIndex,focIndex,anchorNode,focusNode]
                   =[focParent,ancParent,focusOffset,anchorOffset,focIndex,ancIndex,focusNode, anchorNode]
                
                let focusText=focusNode.textContent.slice(focusOffset,focusNode.textContent.length),  
                    anchorText=anchorNode.textContent.slice(0,anchorOffset),
                    end=focIndex

                if(anchorOffset===0 && focusOffset===focusNode.textContent.length)  //If selection contains entire anchor and focus Text
                    {focusText=anchorText="&#65279;"; end+=2}

                else if(anchorOffset===0)   //If selection contains entire anchor Text
                    anchorText="&#65279;"

                else if(focusOffset===focusNode.textContent.length)  //If selection contains entire focus Text
                    focusText="&#65279;"

                ancParent.innerHTML=anchorText
                focParent.innerHTML=focusText

                targetChild.insertBefore(document.createElement("br"),targetChild.children[ancIndex+1])  //Add br after the replaced span

                for(let i=ancIndex+1; i<end; i++)   //Remove all nodes inbetween the anchor and focus node
                    targetChild.children[ancIndex+1].remove()    
            }
        }

        if( e.type==="keydown")
            return

        this.state.debouceChange(e.target.children[0])
        return



        //Under construction
        if(e.keyCode===8 && e.type==="keydown") //Handle backspace keydown event
        {   
            let Selection=window.getSelection()


            if(Selection.isCollapsed===true){

                let selectionParent=Selection.anchorNode.parentNode


                    if((selectionParent.innerHTML==="&nbsp;" || selectionParent.innerHTML===" ") && targetChild.children.length>1){
                        // console.log("Yes")
                        e.preventDefault();
                        selectionParent.remove()
                    }


                    else if(((targetChild.children.length===1 || selectionParent.previousSibling===null) && selectionParent.innerText.length===1) || 
                        ( selectionParent.innerHTML.length===1 && targetChild.children.length>1))
                        {   
                            e.preventDefault();
                            selectionParent.innerHTML="&nbsp;"
                                        //Set the focus on the new line
                            let range=document.createRange()
                            range.setStart(selectionParent,0)
                            range.setEnd(selectionParent,0)
                            Selection.removeAllRanges();
                            Selection.addRange(range)

                        }
    
            }
            else{
                let anchor=Selection.anchorNode, focus=Selection.focusNode
                e.preventDefault()
                if(anchor.parentNode===focus.parentNode)
                {
                    console.log("Equal")
                    console.log(Selection.anchorOffset,Selection.focusOffset, Selection.textContent)

                }
                console.log(anchor,focus)
            }

        }


        if(e.type==="keydown")
            return;

    }

  

    // End of the change function

    styleEvent=(e,attribute,value=undefined)=>{

        let Selection=document.getSelection()
        // if(attribute==="color"){
        //     Selection=this.state.selection
        //     console.log(Selection)

        // }


        


        let {editStyles, defaultStyles}=this.state,
            {anchorNode,focusNode, anchorOffset, focusOffset}=Selection,
            ancParent=anchorNode.parentNode, focParent=focusNode.parentNode,
            tarAtt=e.target.parentNode,
            isSingleChar=(ancParent===focParent && anchorOffset===focusOffset),
            parentEditor=ancParent.parentNode.parentNode


        let fontProps=false
        if(attribute==="fontWeight"||attribute==="fontStyle"||attribute==="textDecoration")
            fontProps=true

        if(e.target.parentNode.tagName==="IMG")
            tarAtt=e.target.parentNode.parentNode

        if(e.target.getAttribute("class").includes("font"))
            tarAtt=e.target.parentNode.parentNode

        if(e.target.getAttribute("class").includes("color"))
            tarAtt=e.target.parentNode.parentNode.parentNode

      

            // console.log(parentEditor,tarAtt.parentNode)
        

        let isSameEditor=(parentEditor.previousSibling===tarAtt.parentNode)

        if(isSameEditor){

            let ancIndex=[...parentEditor.children[0].children].indexOf(ancParent),
                focIndex=[...parentEditor.children[0].children].indexOf(focParent)

            if(focIndex<ancIndex)         //Swap all the properties of focus and anchor node
                [ancParent,focParent,anchorOffset,focusOffset,ancIndex,focIndex,anchorNode,focusNode]
               =[focParent,ancParent,focusOffset,anchorOffset,focIndex,ancIndex,focusNode, anchorNode]
               
            let textLength=anchorNode.textContent.length,
                spanText=anchorNode.textContent.slice(focusOffset,textLength),  
                anchorText=anchorNode.textContent.slice(0,anchorOffset)
        
            if(ancParent.tagName==="SPAN" && focParent.tagName==="SPAN")
            {
            if(isSingleChar)    //Splitting the selected anchor parent into two and adding an empty span in between
                {                           
                    ancParent.innerText=anchorText
                    let emptySpan=document.createElement("span")
                    emptySpan.innerHTML="&#65279;"
                    let temp=ancParent.parentNode.insertBefore(emptySpan,ancParent.nextSibling)
                    temp.style.cssText=ancParent.style.cssText
                    
                    if(fontProps===false)
                        temp.style[attribute]=value

                    if(ancParent.style[attribute]===editStyles[attribute])
                        temp.style[attribute]=defaultStyles[attribute]
                    else if(fontProps===true)
                        temp.style[attribute]=editStyles[attribute]

                    if(anchorOffset!==textLength)
                    {   let nextSpan=document.createElement("span")
                        nextSpan.innerText=spanText
                        nextSpan.style.cssText=ancParent.style.cssText
                        ancParent.parentNode.insertBefore(nextSpan,temp.nextSibling)
                    }
                
                    this.setFocus(document.getSelection(),temp,1)                     
                }

                else if(ancParent===focParent)
                {   
                    let originalText=anchorNode.textContent
                    let nextSpan=document.createElement("span")
 
                    nextSpan.style.cssText=ancParent.style.cssText
                    nextSpan.innerText=ancParent.innerText.slice(anchorOffset,focusOffset)
                    ancParent.parentNode.insertBefore(nextSpan,ancParent.nextSibling)
                    ancParent.innerText=anchorText

                    
                    if(focusOffset!==textLength)
                   { let nextSpanFocus=document.createElement("span")
                    nextSpanFocus.innerText=originalText.slice(focusOffset,textLength)
                    nextSpanFocus.style.cssText=focParent.style.cssText
                    focParent.parentNode.insertBefore(nextSpanFocus,nextSpan.nextSibling)
                    }

                    if(fontProps===false)
                        nextSpan.style[attribute]=value
                    else{                    
                        if(nextSpan.style[attribute]===editStyles[attribute] )
                            nextSpan.style[attribute]=defaultStyles[attribute] 
                        else 
                            nextSpan.style[attribute]=editStyles[attribute]
                        
                    }
             
                }

                else{

                    let target=editStyles[attribute]

                    if(fontProps===false)
                        target=value
                    else if(ancParent.style[attribute]===editStyles[attribute])
                        target=defaultStyles[attribute]

                    let nextSpan

                    if(anchorOffset>0){
                    nextSpan=document.createElement("span")
                    nextSpan.style.cssText=ancParent.style.cssText
                    nextSpan.innerText=ancParent.innerText.slice(anchorOffset,textLength)
                    ancParent.innerText=anchorText
                    ancParent.parentNode.insertBefore(nextSpan,ancParent.nextSibling)
                }
                    
                    if(focusOffset<focusNode.textContent.length){
                    let nextSpanFocus=document.createElement("span")
                    nextSpanFocus.innerText=focParent.innerText.slice(focusOffset,focusNode.textContent.length)
                    nextSpanFocus.style.cssText=focParent.style.cssText
                    focParent.innerText=focParent.innerText.slice(0,focusOffset)
                    focParent.parentNode.insertBefore(nextSpanFocus,focParent.nextSibling)
                    }
                    
                    if(anchorOffset>0 )
                        nextSpan.style[attribute]=target
                    else 
                        ancParent.style[attribute]=target

                    focParent.style[attribute]=target

                    for(let i=ancIndex+1; i<focIndex+1; i++){
                        if(parentEditor.children[0].children[i].tagName!=="BR")
                            parentEditor.children[0].children[i].style[attribute]=target
                    }
                }
            }
        this.state.debouceChange(parentEditor.children[0])

        }
        this.setStyleEditor()
    }


    render() { 
        let displayStrings=[]                       //Array of strings to be displayed and edited
        let Text=JSON.parse(JSON.stringify(this.props.text))
        this.groupTextStyles(Text,displayStrings)
        let {editStyles:{color}}={...this.state}

        return ( 
            <React.Fragment>
                <div className="mt-2 mb-2 editorTextBoxOuter" style={{}}>

                     {/* Contains the editors elements/options */}
                    <div className="editorStyleBox d-flex flex-row justify-content-center">

                        <button  className="btn styleAtb" type="btn"  style={{  padding: 0,border:"none"}}  data-toggle="tooltip" data-placement="top" title="Bold"
                                 onClick={(e)=>{this.styleEvent(e,"fontWeight")}} 
                        >
                                <img alt="Alt" className="img-responsive styleImg" src="http://localhost:3000/icons/bold.png"/>
                        </button>

                        <button  className="btn styleAtb" type="btn"  style={{  padding: 0,border:"none"}}  data-toggle="tooltip" data-placement="top" title="Italic"
                                 onClick={(e)=>{this.styleEvent(e,"fontStyle")}} 
                        >
                                <img alt="Alt" className="img-responsive styleImg" src="http://localhost:3000/icons/italic.png"/>
                        </button>

                        <button  className="btn styleAtb" type="btn"  style={{  padding: 0,border:"none"}}  data-toggle="tooltip" data-placement="top" title="Underline"
                                onClick={(e)=>{this.styleEvent(e,"textDecoration")}} 
                        >
                                <img alt="Alt" className="img-responsive styleImg" src="http://localhost:3000/icons/underline.png"/>
                        </button>
                        <div className="lineBreak"  ></div>

                        <div className="dropdown" >
                            <button className="btn dropdown-toggle " type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" data-display="static">
                                <span style={{color:"rgb(100,124,140)"}} className="styleAtb btn-font"  data-toggle="tooltip" data-placement="top"
                                      title="Alice"
                                >Alice</span>
                            </button>
                            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{width:"100%"}}>
                                {
                                    fonts.map((font,id)=>{
                                        return <a className="dropdown-item font" key={id} href="#" style={{color:"rgb(100,124,140)",backgroundColor:"white"}} 
                                                onClick={(e)=>{this.styleEvent(e,"fontFamily",font)}}
                                                >{font}</a>
                                    })
                                }
                            </div>
                        </div>
                        <div className="lineBreak" ></div>

                        <div className="dropdown">
                            <button className="btn dropdown-toggle styleAtb" type="button" id="dropdownMenuButtonFont" data-toggle="dropdown" aria-haspopup="true" data-display="static">
                                <img alt="Alt" data-toggle="tooltip" data-placement="top" style={{width:"22px"}}
                                      title="Text color" className="img-responsive styleImg" src="http://localhost:3000/icons/textColor.png">
                                </img>
                            </button>
                            <div className="dropdown-menu dropdown-menu-right colorParent" aria-labelledby="dropdownMenuButtonFont"                            >
                                <div className="d-flex flex-row  flex-wrap" style={{backgroundColor:"white"}} >
                                    {
                                        color.map((c,id)=>{
                                            return <div onClick={(e)=>{e.preventDefault();this.styleEvent(e,"color",c)}} style={{backgroundColor:c, width:"15px",height:"15px"}} className="column m-1 color" key={id}
                                            data-toggle="tooltip" data-placement="top" title={c}>
                                                   </div>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="lineBreak" ></div>
                    </div>                  

                    {/*Contains the text being edited*/} 
                    <div   className="editorTextBox"                           
                                onKeyDown={(e)=>{ 
                                    this.onChange(e)}} 
                                onKeyUp={(e)=>{ 
                                        this.onChange(e)}} 
                                onCut={(e)=>{ 
                                    this.onChange(e)}}

                                onMouseUp={(e)=>{
                                        this.setStyleEditor(e); 
                                }}


                                // onMouseDown={()=>this.setSelection()}


                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                id={"editorTextKey"+this.props.domId}
                                >
                                <p  className="editorText" 
                                >
                                    {   displayStrings.length>0?
                                            displayStrings.map((st,id)=>{
                                                if(st.tag==="br")
                                                    return<br key={`${id}`}></br>
                                                return <span style={st.style} key={`${id}`} className="editorText">
                                                    {`${st.text}`}
                                                </span>
                                            })
                                            :""
                                    }
                                </p>

                    </div> 
                </div>
            </React.Fragment>

         );
    }
}
 
export default TextEditor;