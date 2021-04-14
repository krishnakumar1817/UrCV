import React, { Component } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
// @ts-ignore
import "bootstrap/dist/js/bootstrap.min.js";
import 'jquery/dist/jquery.min.js';
import '../css/ImgEditor.css'
class ImgEditor extends Component {
    constructor(props){
        super(props);
    }

    //Upload the image and send to parent
    uploadImage=(e)=>{

        let reader=new FileReader();                 //Read the uploaded image
        reader.readAsDataURL(e.target.files[0])      //Convert the uploaded image into URI
        let imgNode=e.target.parentNode.nextSibling.children[0];
        let img=JSON.parse(JSON.stringify(this.props.img))
        let index=this.props.index
        reader.onload=()=>{
            img.contents.src=reader.result;
            this.props.modifyImage(index,img);    //Send the image to parent and update
            imgNode.setAttribute("src",reader.result)
        }


    }

    render() { 
        let {img,index}=this.props
        // console.log(img)
        return  <div  className="mt-2 mb-2 imgEditorOverlay" style={{}}
        >           
                    <div className="imgOptOly d-flex flex-row " style={{display:"none"}}>
                        <label htmlFor="img-upload" className="imgEdtOpt col">Replace</label>
                        <input type="file" accept="image/*" id="img-upload" onChange={(e)=>this.uploadImage(e)}
                        />
                        <div style={{ width: "2px",background:  "white"}}>
                        </div>
                        <label className="imgEdtOpt col">
                            Edit
                        </label>
                    </div>

                   
                    
                    <div className="mt-1 mb-1 imgEditor d-flex justify-content-center align-items-center">
                        <img className="img-fluid imgEdt" src={`${img.contents.src}`}  
                        >
                        </img>
                    </div>
 
                </div>
    }
}
 
export default ImgEditor;
// 