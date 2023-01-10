import * as React from 'react';
import {Component} from "react";
import {ReactComponent as Add} from "../icons/add-24px.svg"
import {ReactComponent as Remove} from "../icons/remove-24px.svg"



interface IProps {
    image:File
    size:number
    blackCircle:boolean
    setImageGetFunction:(functie:()=>Promise<Blob>)=>void
}

interface IState {
    x:number
    y:number
    scale:number
    width:number
    height:number
    image:HTMLImageElement
}

class ProfielFotoBijsnijder extends Component<IProps,IState>{
    canvas: React.RefObject<HTMLCanvasElement>;

    constructor(props : IProps){
        super(props)
        this.canvas=React.createRef()
        this.state={
            x:0,
            y:0,
            scale:1,
            width:0,
            height:0,
            image:null
        }
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
        if(this.props.image!==prevProps.image){
            var fileReader=new FileReader()
            fileReader.onload= (event:ProgressEvent)=>{
                var image= new Image()
                image.onload=()=>{
                    console.log("Rezise")
                    //als de afbeelding geladen is wordt deze getekend op het canvas
                    var lijst=[image.height,image.width]
                    var min=Math.min(...lijst)
                    var scale=this.props.size/min

                    this.setState({
                        x:0,
                        y:0,
                        width:image.width,
                        height:image.height,
                        scale:scale,
                        image:image
                    })

                    this.draw()
                }
                image.src =fileReader.result.toString()
            }


            fileReader.readAsDataURL(this.props.image)

        }
    }


    componentDidMount() {
        this.props.setImageGetFunction(this.getImage)
    }

    //Als je deze functie aanroept krijg je de profielfoto terug
    //Deze Functie wordt straks aangeroepen vanuit Registratie
    getImage=():Promise<Blob>=>{
        return new Promise(resolve => {
            this.canvas.current.toBlob(blob=>{
                resolve(blob)
            })
        })
    }

     drawLoop=()=>{
        //Deze functie wordt alleen geactiveerd als er een foto is gelecteerd
        if(this.state.image!==null){
            //this.IProps.position
            this.draw()
        }
    }

    draw=()=>{
        const canvas = this.canvas.current;
        const ctx = canvas.getContext('2d');
        const image = this.state.image;
        const {x,y,width,height,scale}=this.state

        ctx.save()
        ctx.fillStyle="#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore()

        ctx.save()

        ctx.drawImage(image,x,y,width*scale,height*scale)

        if(this.props.blackCircle){
            ctx.fillStyle="rgba(0,0,0,0.6)"
            ctx.fillRect(0,0,canvas.width,canvas.height)
            ctx.closePath()


            ctx.beginPath();
            var circlePosition=this.props.size/2
            ctx.arc(circlePosition, circlePosition, circlePosition, 0, Math.PI * 2, true);
            ctx.clip()

            ctx.fillStyle="#ffffff"
            ctx.fillRect(0,0,canvas.width,canvas.height)

            ctx.drawImage(image,x,y,width*scale,height*scale)
            ctx.restore()
        }
    }

    scale=(amount:number)=>{
        const {width,height}=this.state
        const startWith=width*this.state.scale
        const startHeight=height*this.state.scale

        this.setState(oldState => {return {scale:oldState.scale*amount}},()=>{
            const xBijstelling=(width*this.state.scale-startWith)/2
            const yBijstelling=(height*this.state.scale-startHeight)/2
            this.setState(oldState=>{return {x:oldState.x-xBijstelling,y:oldState.y-yBijstelling}})
        } )
    }

    moveEventHandler=(event:React.MouseEvent)=>{
        //Als je de muis ingedrukt is voert hij deze functie uit
        if(event.buttons===1){
            this.moveImage(event.movementX,event.movementY)
        }
    }

    moveImage=(amountX:number|null,amountY:number|null)=>{
        this.setState(oldState=>{return{
            x:oldState.x+amountX,
            y:oldState.y+amountY
        }},this.drawLoop)
    }

    render() {
        //Iedere keer als de IState veranderd, wordt het canvas ook bijgewerkt
        //als het canvas nog niet defined is doet hij niet
        this.drawLoop()
        return(
            <div style={{background:"white"}}>
                <canvas onMouseMove={this.moveEventHandler} className="moveAble" ref={this.canvas} width={this.props.size} height={this.props.size} ></canvas>
                <div className="row center" style={{padding:"5px 0"}}>
                    <div aria-selected={"false"} onClick={()=>this.scale(1.05)}><Add /></div>
                    <div aria-selected={"false"} onClick={()=>this.scale(0.95)}><Remove/></div>
                </div>
            </div>
        )
    }
}
export default ProfielFotoBijsnijder