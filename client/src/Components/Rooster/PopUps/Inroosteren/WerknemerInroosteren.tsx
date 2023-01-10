import React, {Component} from "react";
import {Autocomplete} from "@material-ui/lab";
import {Chip} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Avatar from "@material-ui/core/Avatar";


export interface Person{
    id:number
    naam:string
}

interface IProps {
    apiLink:string
    close:()=>void
}

interface IState {
    datum:string
    beginTijd:string
    eindTijd:string
    werknemers:Person[]
    selectedNames:Person[],
    loading:boolean,
    validToSubmit:HTMLInputElement[]
}
class WerknemerInroosteren extends Component<IProps,IState>{
    private datum:React.RefObject<HTMLInputElement>;
    private beginTijd:React.RefObject<HTMLInputElement>;
    private eindTijd:React.RefObject<HTMLInputElement>;


    constructor(props:IProps){
        super(props);
        this.datum=React.createRef();
        this.beginTijd=React.createRef();
        this.eindTijd=React.createRef();
        this.state={
            beginTijd:"",
            eindTijd:"",
            datum:"",
            werknemers:[],
            selectedNames:[],
            loading:false,
            validToSubmit:[]
        }
    }

    componentDidMount(): void {
        this.getUsers();
        this.setState({validToSubmit:[this.datum.current,this.beginTijd.current,this.eindTijd.current]})
    }


    /**
     * Hier worden de werknemers die aan dit rooster deelnemen weergegeven
     */
    getUsers= async ()=>{
        const result=await fetch(this.props.apiLink+"/GetMedewerkers",{headers:{authToken:sessionStorage.getItem("authToken")}});
        const resultJSON=await result.json();
        this.setState({werknemers:resultJSON})
    };

    /**
     * Deze code roostert mensen in
     */
    inroosteren=async ()=>{
        await this.state.validToSubmit.map(value => this.validate(value));
        //Er wordt hier gekeken of er geen fouten in de velden zitten

        if(this.state.validToSubmit.length===0){
            this.setState({loading:true});
            await fetch(this.props.apiLink+"/rooster/add",
                {
                    method:"POST",
                    headers:{
                        authToken:sessionStorage.getItem("authToken"),
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify({date:this.state.datum,beginTijd:this.state.beginTijd+":00",eindTijd:this.state.eindTijd+":00",users:this.state.selectedNames.map(value => value.id)})
                });
            this.setState({loading:false});
            this.props.close()
        }else{
            //Hier worden de fouten weergegeven als zich voordoen
            this.state.validToSubmit.forEach(value => value.reportValidity())
        }
    };

    /**
     * Deze functie controleerd of het html-element wel valide is.
     * Als deze niet valide is wordt deze aan de state toegevoegd.
     * @param target Het HTML Element dat moet worden gecheckt
     */
    validate=async (target:HTMLInputElement)=>{
        if(!target.required||!target.checkValidity()){
            this.setState(oldState=>{
                if(!oldState.validToSubmit.includes(target)){
                    oldState.validToSubmit.push(target)
                }
                return {validToSubmit: oldState.validToSubmit}
            })
        }else{
            this.setState(oldState=>{
                const deletedList=oldState.validToSubmit.filter((value1, index) => value1 !==target);
                return {validToSubmit: deletedList}
            })
        }
    };

    /**
     * Iedere keer als er een veld wordt aangepast wordt er gekeken of deze valide is d.m.v. de validate functie
     */
    handleInputChange=(event:React.ChangeEvent<HTMLInputElement>)=> {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.validate(target);

        this.setState<never>({
            [name]: value
        });
    };


    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="hunderMaxHeight scrolOverflow">
            <h1 className="noTopMargin">Inroosteren</h1>
            <tbody>
            <tr>
                <td>Personen:</td>
                <td>
                    <div className="row">
                        <Autocomplete
                            style={{width: 300}}
                            noOptionsText={"Geen werknemer gevonden"}
                            multiple={true}
                            filterSelectedOptions={true}
                            loading={this.state.werknemers.length == 0}
                            renderInput={params => (
                                <TextField  {...params} multiline={true} variant="outlined"/>

                            )}
                            options={this.state.werknemers}
                            renderTags={(value: Person[], getTagProps) => {
                                return value.map((value, index) => {
                                    return <Chip {...getTagProps({index})} avatar={<Avatar
                                        src={this.props.apiLink + "/avatarWithId/" + value.id}/>} label={value.naam}/>
                                })
                            }}
                            renderOption={option => {
                                return (
                                    <div className="row centerContent">
                                        <img className="avatar avatarMini"
                                             src={this.props.apiLink + "/avatarWithId/" + option.id}/>
                                        <p>{option.naam}</p>
                                    </div>
                                )
                            }}
                            onChange={(event, value) => {
                                this.setState({selectedNames: value})
                            }}
                        />
                    </div>
                </td>
            </tr>
            <tr>
                <td>Datum:</td>
                <td><input ref={this.datum} className="styleInput" type={"date"} required value={this.state.datum.toString()} onChange={this.handleInputChange} name={"datum"}/></td>
            </tr>
            <tr>
                <td>BeginTijd:</td>
                <td><input ref={this.beginTijd} className="styleInput" type={"time"} required min={"00:00"} max={this.state.eindTijd} value={this.state.beginTijd} onChange={this.handleInputChange} name={"beginTijd"}/></td>
            </tr>
            <tr>
                <td>EindTijd:</td>
                <td><input ref={this.eindTijd} className="styleInput centerContent" required min={this.state.beginTijd} max={"23:59"} type={"time"} value={this.state.eindTijd} onChange={this.handleInputChange} name={"eindTijd"}/></td>
            </tr>
            </tbody>
            {
                this.state.loading ?
                    <img style={{width:200}} src={require("../../../../img/Loding-Icon-zwart.gif")}/> :
                    <div>
                        <button className="Button" onClick={this.inroosteren}>Inroosteren</button>
                        <button className="Button" onClick={this.props.close}>Sluiten</button>
                    </div>
            }

        </div>
    }
}
export default WerknemerInroosteren