import React, {Component} from "react";
import {itemComponentsData} from "../../Rooster Classes/roosterData";
import LosItemWijzigen, {changeHigherStateInsideFunc} from "./LosItemWijzigen";
import {ReactComponent as Done} from "../../../../icons/done-24px.svg";
import {ReactComponent as Create} from "../../../../icons/create-24px.svg";
import {Person} from "../Inroosteren/WerknemerInroosteren";
import TextField from "@material-ui/core/TextField";
import {Chip} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import {Autocomplete} from "@material-ui/lab";
import Functions from "../../../../Extra Functions/functions";
import {roosterStructuurItemData, Werknemer, Werknemers} from "../../../../Pages/Rooster";

interface IProps {
    RoosterData:itemComponentsData
    apiLink:string
    close:()=>void

}
export interface IState extends Werknemers {
    beginTijd:string
    eindTijd:string
    datum:Date
    edit:boolean
    validToSubmit:boolean
    names:Person[]
    newNames:Person[]
    selectedNames:Person[],
    inroosteren:boolean
}

class ItemWijzigen extends Component<IProps,IState>{
    private beginTijd: React.RefObject<HTMLInputElement>
    private eindTijd: React.RefObject<HTMLInputElement>

    constructor(props:IProps){
        super(props)
        this.state={
            beginTijd:"",
            eindTijd:"",
            datum:new Date(),
            werknemers:[],
            edit:false,
            validToSubmit:true,
            names:[],
            newNames:[],
            selectedNames:[],
            inroosteren:false
        }
        this.beginTijd=React.createRef()
        this.eindTijd=React.createRef()
    }


    /**
     * Hier worden alle gebruikers opgehaald die bij dit rooster horen
     */
    getUsers= async ()=>{
        const result=await fetch(this.props.apiLink+"/GetMedewerkers",{headers:{authToken:sessionStorage.getItem("authToken")}})
        const resultJSON:Person[]=await result.json()
        await this.setState({names:resultJSON})

    }

    /**
     * Hier worden de namen die nog niet zijn ingeroosterd eruit gehaald
     * Zo kan er een lijst worden gemaakt van werknemers die nog los kunnen worden ingeroosterd
     */
    updateNewNames=async ()=>{
        console.log(this.state.werknemers)
        const personList=this.state.names.filter(value => {
            return !this.state.werknemers.some(value1 => value1.userId===value.id)
        })
        await this.setState({newNames:personList})
    }

    /**
     * Deze functie zorgt ervoor dat werknemers worden ingeroosterd
     */
    inroosteren=async ()=>{
        this.setState({inroosteren:true})
        var names = this.state.selectedNames
        const result = await fetch(this.props.apiLink + "/rooster/add",
            {
                method: "POST",
                headers: {
                    authToken: sessionStorage.getItem("authToken"),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: new Date(this.state.datum),
                    beginTijd: this.state.beginTijd + ":00",
                    eindTijd: this.state.eindTijd + ":00",
                    users: names.map(value => value.id)
                })
            })
                const jsonResult = await result.json()
                console.log(jsonResult)
                console.log(Functions.range(jsonResult.insertId + jsonResult.affectedRows-1,jsonResult.insertId ))
                const itemIds = Functions.range(jsonResult.insertId + jsonResult.affectedRows-1,jsonResult.insertId )
                var objects = names.map((value, index) => {
                    return Object.assign(value,{itemId:itemIds[index]})
                });
                this.setState(oldState=>{
                    objects.forEach(value =>{
                        oldState.werknemers.push({beginTijd:new Date(this.state.beginTijd),eindTijd:new Date(this.state.eindTijd),naam:value.naam,itemId:value.itemId,userId:value.id})
                    })
                    return {selectedNames:[],werknemers:oldState.werknemers,inroosteren:false}},this.updateNewNames
                )

      }


     componentDidMount=async ()  =>{
        var userData=this.props.RoosterData.UserData.map(value => {
            return Object.assign(value,{beginTijd:new Date(this.props.RoosterData.beginTijd),eindTijd:new Date(this.props.RoosterData.eindTijd)})
        })
        this.setState({
            beginTijd:new Date(this.props.RoosterData.beginTijd).toLocaleTimeString('nl-NL',{hour:"2-digit",minute:"2-digit"}),
            eindTijd:new Date(this.props.RoosterData.eindTijd).toLocaleTimeString('nl-NL',{hour:"2-digit",minute:"2-digit"}),
            datum:new Date(this.props.RoosterData.datum),
            werknemers:userData
        })
        await this.getUsers()
        this.updateNewNames()
    }

    handleInputChange=(event:React.ChangeEvent<HTMLInputElement>)=> {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        //: target.type=== 'time'? new Date(target.value)

        if(target.checkValidity()){
            this.setState({validToSubmit:true})
        }else{
            this.setState({validToSubmit:false})
        }

        this.setState<never>({
            [name]: value
        });
    }

    changeState=(functie:changeHigherStateInsideFunc)=>{
       this.setState<never>((oldstate)=>{return functie(oldstate)},() => {
           this.updateNewNames()
           if(this.state.werknemers.length===0){
               this.props.close()
           }
       })
    }



    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <div className="hunderMaxHeight heightTable scrolOverflow">
                <h1 className="noTopMargin">Wijzig werktijden</h1>
                <table>
                    <tbody >
                    <tr>
                        <td>
                        </td>
                        <td>
                            Datum:
                        </td>
                        <td>
                            {this.state.datum.toLocaleDateString()}
                        </td>
                    </tr>
                    <tr>
                        <td>
                        </td>
                        <td>
                            Tijden:
                        </td>
                        <td>
                            {
                            this.state.edit ?
                                <div className="row styleInput">
                                    <input type="time" ref={this.beginTijd}  required={true} min={"00:00"} max={this.state.eindTijd} name={"beginTijd"} onChange={this.handleInputChange} value={this.state.beginTijd}/>
                                    <input type="time" ref={this.eindTijd} required={true} min={this.state.beginTijd} max={"23:59"}  name={"eindTijd"} onChange={this.handleInputChange} value={this.state.eindTijd}/>
                                </div> :
                                <div className="row">
                                    <p>{this.state.beginTijd} - {this.state.eindTijd}</p>
                                </div>
                        }
                        </td>
                        <td>
                            {
                                this.state.edit?
                                    <Done onClick={() => {
                                        if(this.state.validToSubmit){
                                            console.log(this.state.werknemers)
                                            var newWerknemers=this.state.werknemers.map(value=>{
                                                fetch(this.props.apiLink+"/rooster/change/"+value.itemId,{
                                                    method:"POST",
                                                    headers:{
                                                        authToken:sessionStorage.getItem("authToken"),
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body:JSON.stringify({beginTijd:this.state.beginTijd+":00",eindTijd:this.state.eindTijd+":00"})
                                                })

                                                return {...value,beginTijd:new Date(this.state.beginTijd),eindTijd:new Date(this.state.eindTijd)}
                                            })
                                            console.log(newWerknemers)
                                            this.changeState(oldState => ({werknemers:newWerknemers}))
                                            this.setState({edit: false})
                                        }else {
                                            this.beginTijd.current.reportValidity()
                                            this.eindTijd.current.reportValidity()
                                        }
                                    }}/>
                                    :
                                    <Create onClick={() => {
                                        this.setState({edit: true})
                                    }}/>
                            }
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>Personen:</td>
                        <td>
                            <Autocomplete
                            noOptionsText={"Geen werknemer gevonden"}
                            multiple={true}
                            filterSelectedOptions={true}
                            value={this.state.selectedNames}
                            renderInput={params => (
                                <TextField {...params} variant="outlined" fullWidth />
                            )}
                            options={this.state.newNames}
                            renderTags={(value:Person[], getTagProps) => {
                                return value.map((value,index) =>{
                                    return <Chip {...getTagProps({ index })} avatar={<Avatar src={this.props.apiLink+"/avatarWithId/"+value.id}/>} label={value.naam} />
                                })
                            }}
                            renderOption={option => {
                                return(
                                    <div className="row centerContent">
                                        <img className="avatar avatarMini" src={this.props.apiLink+"/avatarWithId/"+option.id}/>
                                        <p>{option.naam}</p>
                                    </div>
                                )
                            }}
                            style={{ width: 300 }}
                            onChange={(event, value) => {
                                this.setState({selectedNames:value})
                            }}
                        />
                        </td>
                        <td>
                            {
                                (this.state.inroosteren || this.state.selectedNames.length===0)  ||
                                <button className="Button" onClick={ event => {
                                    this.inroosteren()
                                    this.updateNewNames()
                                }} >inroosteren</button>
                            }

                        </td>
                    </tr>
                    </tbody>
                </table>
                <table className="maxFullHeight overFlowAuto thinScrollBar minHeight">
                    {this.state.werknemers.map((value, index) => {
                        return(
                           <LosItemWijzigen changeHigherState={this.changeState} index={index} itemId={value.itemId} userId={value.userId} naam={value.naam} beginTijd={value.beginTijd.toJSON()} eindTijd={value.eindTijd.toJSON()} apiLink={this.props.apiLink}>
                            <p>{this.state.beginTijd.split(":").slice(0,-1).join(":")}-{this.state.eindTijd.split(":").slice(0,-1).join(":")}</p>
                           </LosItemWijzigen>
                        )
                    })}
                </table>
                <button className="Button" onClick={this.props.close} >Sluiten</button>
            </div>
        )
    }
}
export default ItemWijzigen