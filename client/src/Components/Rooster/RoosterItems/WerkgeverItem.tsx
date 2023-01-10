import React from 'react'
import {ReactComponent as CreateIcon} from '../../../icons/create-24px.svg'
import {itemComponentsData} from "../Rooster Classes/roosterData";

interface IProps {
    itemData:itemComponentsData
    apiLink:string
    onClick?:(event:React.MouseEvent)=>void
}

interface IState {
    divRef:HTMLDivElement|{clientWidth:number,clientHeight:number}
    changeRef:boolean
}

class  WerkgeverItem extends React.Component<IProps,IState>{
    public changeFuncties:()=>void

    constructor(props:IProps){
        super(props)
        this.state={
            divRef:{clientWidth:0,clientHeight:0},
            changeRef:true
        }
        this.changeFuncties=()=>{
            console.log()
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


    render() {
        return(
            <div onClick={this.props.onClick} ref={instance => this.state.changeRef && this.setState({divRef:instance,changeRef:false})} className="column isideItem roosterItem noOverflow">
                <div className="row">
                    {/*<p className="onAccent noMargin" >{new Date(this.props.itemData.beginTijd).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}-{new Date(this.props.itemData.eindTijd).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}</p>*/}

                    {/*
                        <details className="chooseMenu right">
                            <div>
                                <OptionWithIcon icon="people-24px.svg" text="Vervanging Regelen"/>
                                <OptionWithIcon icon="local_hospital-24px.svg" text="Ziek Melden"/>
                                <OptionWithIcon icon="disable_person.svg" text="Vrij Vragen"/>
                            </div>
                            <summary>
                                <MoreOptions width={35} height={35} className="onAccent right"/>
                            </summary>
                        </details>
                    */}
                </div>
                <CreateIcon className="center noVertMargin onAccent"/>
                <p className="center">{this.props.itemData.UserData.length} </p>
                {(this.state.divRef.clientWidth>100&&this.state.divRef.clientHeight>90)&&<p className="center">Medewerker{this.props.itemData.UserData.length>1&&"s"}</p>}
                {(this.state.divRef.clientWidth>100&&this.state.divRef.clientHeight>80)&&<p className="center">{new Date(this.props.itemData.beginTijd).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})} - {new Date(this.props.itemData.eindTijd).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}</p>}
                {
                    (this.state.divRef.clientWidth>100&&this.state.divRef.clientHeight >100) &&
                    <div className="scrolOverflow thinScrollBar" >
                        {
                            this.props.itemData.UserData.map(value => {
                                return (
                                    <div className="row centerContent" style={{marginBottom:5}}>
                                        <img className="avatar avatarMini" src={this.props.apiLink+"/avatarwithid/"+value.userId}/>
                                        <p className="name">{value.naam}</p>
                                    </div>)
                            })
                        }
                    </div>
                }

            </div>
        )
    }

}
export default WerkgeverItem