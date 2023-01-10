import React, {Component} from "react";
import {ReactComponent as Create} from '../../../../icons/create-24px.svg'
import {ReactComponent as Done} from '../../../../icons/done-24px.svg'
import {ReactComponent as Delete} from '../../../../icons/close-24px.svg'
import {Werknemers} from "../../../../Pages/Rooster";
import Functions from "../../../../Extra Functions/functions";

export type changeHigherStateInsideFunc=<T extends Werknemers, >(oldState:T)=> Werknemers
export type changeHigerStateFunc=(functie:  changeHigherStateInsideFunc )=> void


interface IProps {
    index: number
    itemId: number
    userId: number
    naam: string
    beginTijd: string
    eindTijd: string
    apiLink: string
    changeHigherState: changeHigerStateFunc
}

interface IState{
    edit:boolean
    validToSubmit:boolean
    deleted:boolean
}

/**
 * In dit item moet je als body de normale display data staan
 */
class LosItemWijzigen extends Component<IProps,IState>{
    private beginTijd: React.RefObject<HTMLInputElement>
    private eindTijd: React.RefObject<HTMLInputElement>


    constructor(props:IProps){
        super(props);
        this.state={
            edit:false,
            validToSubmit:true,
            deleted:false
        }
        this.beginTijd=React.createRef()
        this.eindTijd=React.createRef()
    }



    handleInputChange=(event:React.ChangeEvent<HTMLInputElement>)=> {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name:string= target.name;
        //: target.type=== 'time'? new Date(target.value)

        if(target.checkValidity()){
            this.setState({validToSubmit:true})
        }else{
            this.setState({validToSubmit:false})
        }

        if(name.includes("Tijd") && typeof value==="string")
        {   this.props.changeHigherState(oldState =>{
            var werknemer=oldState.werknemers[this.props.index];
            var date=Functions.timeStringToDate(value);
            console.log(date)
            // @ts-ignore
            werknemer[name]=date;
            return {werknemers: oldState.werknemers}
        });}


    };

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <tr>
                <td>
                    <img className="avatarMini avatar" src={this.props.apiLink+"/avatarWithId/"+this.props.userId}/>
                </td>
                <td>
                    <div>
                        <p className="noVertMargin">{this.props.naam}</p>
                    </div>
                </td>
                    <td>
                        {
                            this.state.deleted ?
                                <img src={require("../../../../img/Loding-Icon-zwart.gif")} width={"75px"}/> :
                            (this.state.edit?
                                <Done onClick={async ()=>{
                                    if(this.state.validToSubmit) {
                                        this.setState({edit: false});
                                        await fetch(this.props.apiLink + "/rooster/change/" + this.props.itemId, {
                                            method: "POST",
                                            headers: {
                                                authToken: sessionStorage.getItem("authToken"),
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                beginTijd: this.props.beginTijd + ":00",
                                                eindTijd: this.props.eindTijd + ":00"
                                            })
                                        })
                                    }else{
                                        this.beginTijd.current.reportValidity();
                                        this.eindTijd.current.reportValidity()
                                    }
                                }} />
                                :
                                <Create onClick={()=>{this.setState({edit:true})}} />
                                )
                        }
                    </td>
                <td>
                    {
                        (!this.state.edit && !this.state.deleted) &&
                        <Delete onClick={(async ()=>{
                            this.setState({deleted:true})
                            await fetch(this.props.apiLink+"/rooster/remove/"+this.props.itemId,{
                                method:"delete",
                                headers:{
                                    authToken:sessionStorage.getItem("authToken")
                                }
                            });
                            this.props.changeHigherState(oldState => {return {werknemers:oldState.werknemers.filter((value, index) => index!==this.props.index)}} )
                            this.setState({deleted:false})
                        })}/>
                    }
                </td>
                <td >
                    <div className="row centerContent">
                        {
                            this.state.edit?
                                <div className="row styleInput">
                                    <input  type="time" name={"beginTijd"} ref={this.beginTijd}  required={true} min={"00:00:00"} max={this.props.eindTijd} onChange={this.handleInputChange} value={this.props.beginTijd}/>
                                    <input  type="time" name={"eindTijd"}  ref={this.eindTijd} required={true} min={this.props.beginTijd} max={"23:59"}  onChange={this.handleInputChange} value={this.props.eindTijd}/>
                                </div>:
                                this.props.children
                        }
                    </div>
                </td>
            </tr>
        )
    }
}
export default LosItemWijzigen