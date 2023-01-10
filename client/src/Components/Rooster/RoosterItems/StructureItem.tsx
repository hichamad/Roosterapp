import React from "react";
import {roosterStructuurItemData} from "../../../Pages/Rooster";
import {ReactComponent as CreateIcon} from "../../../icons/create-24px.svg";



interface IState {
    divRef:HTMLDivElement|{clientWidth:number,clientHeight:number}
    changeRef:boolean
}

interface IProps extends roosterStructuurItemData{
    apiLink:string
    onClick?:(event:React.MouseEvent)=>void
}

class StructureItem extends React.Component<IProps,IState>{

    public changeFuncties:()=>void

    constructor(props:IProps){
        super(props)
        this.state={
            divRef:{clientWidth:0,clientHeight:0},
            changeRef:true
        }
        this.changeFuncties=()=>{
            this.setState({changeRef:true})
        }
    }

    componentDidMount(): void {
        this.changeFuncties()
        window.addEventListener('resize',this.changeFuncties)
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize',this.changeFuncties)
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <div onClick={this.props.onClick} style={{backgroundColor:this.props.color,color:this.props.werknemers.length<this.props.aantalWerknemers&&"red"}} ref={instance => this.state.changeRef && this.setState({divRef:instance,changeRef:false})} className="column isideItem roosterItem noOverflow">
                <div className="row">
                    <p className="center" >{this.props.titel} </p>
                </div>
                <CreateIcon className="center noVertMargin onAccent"/>
                <p className="center" >{this.props.werknemers.length}/{this.props.aantalWerknemers} </p>
                {<p className="center">Medewerker{this.props.werknemers.length>1&&"s"}</p>}

            </div>
        )
    }
}
export default StructureItem