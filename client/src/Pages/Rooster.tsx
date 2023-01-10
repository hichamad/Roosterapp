import React, {Component, ReactElement} from "react";
import WeekKiezer from "../Components/Rooster/WeekKiezer";
import loadingIcon from "../img/Loding-Icon-zwart.gif";
import RoosterComponent from "../Components/Rooster/RoosterStructuur/RoosterComponent";
import {DagData} from "../Components/Rooster/RoosterStructuur/DagField";
import RoosterItem from "../Components/Rooster/RoosterItems/RoosterItem";
import WerknemerItem from "../Components/Rooster/RoosterItems/WerknemerItem";
import WerkgeverItem from "../Components/Rooster/RoosterItems/WerkgeverItem";
import PopUp from "../Components/Rooster/PopUps/PopUp";
import ItemWijzigen from "../Components/Rooster/PopUps/Normaal Item/ItemWijzigen";
import RoosterData, {
    BeginEindTijd,
    fullRenderItem,
    itemComponentsData,
    roosterItemRenderFunc
} from "../Components/Rooster/Rooster Classes/roosterData";
import OptionWithIcon from "../Components/OptionWithIcon";
import WerknemerInroosteren from "../Components/Rooster/PopUps/Inroosteren/WerknemerInroosteren";
import { sortedData} from "../Components/Rooster/RoosterStructuur/sortData";
import StructureItem from "../Components/Rooster/RoosterItems/StructureItem";
import TijdvakWeergeven from "../Components/Rooster/PopUps/structureItem/TijdvakWeergeven";
import StructureData from "../Components/Rooster/Rooster Classes/StructureData";


export interface roosterStructuurData{
    id:number
    roosterid:number
    dagNummer:number
    titel: string
    aantalWerknemers:number
    beginTijd:string
    eindTijd:string
    color:string
}

export interface Werknemer{beginTijd:Date,eindTijd:Date,naam:string,userId:number,itemId:number}
export interface Werknemers{werknemers:Werknemer[]}
export type roosterStructuurItemData=roosterStructuurData & {datum:string,beginTijd:string,eindTijd:string} & Werknemers


interface IState {
    agendaJSON:fullRenderItem,
    beginDatum:Date,
    loading:boolean
    popUpStack:React.ReactElement[]
    minTijd:Date
    maxTijd:Date
    roosterStructuurData:roosterStructuurData[]
}

interface IProps {
    apiLink:string
    isWerkgever:boolean
}

class Rooster extends Component<IProps,IState>{

    constructor(props:IProps){
        super(props);
        this.state={
            agendaJSON:{},
            beginDatum:new Date(),
            loading:true,
            popUpStack:[],
            maxTijd:new Date(),
            minTijd:new Date(),
            roosterStructuurData:[]
        }
    }

    componentDidMount=async ()=> {
        this.updateRoosterStructure()
    }

    refreshRooster=async ()=>{
        var renderdAgendaJSON:sortedData<roosterItemRenderFunc>

        //Hier wordt de data uit de server gehaald en in de state gezet
        this.setState({loading:true})
        var res=await fetch(this.props.apiLink+"/rooster/get",{
            method:"POST",
            headers:{
                "authToken":sessionStorage.getItem("authToken"),
                "Content-Type":"application/json"
            },
            body:JSON.stringify({beginDatum:this.state.beginDatum,
            eindDatum:new Date(this.state.beginDatum.getTime()+(1000*60*60*24*7))})
        }).catch(reason => {console.log(reason)});

        var agendaJSON=[];
        if(typeof res !=="undefined"){
            agendaJSON=await res.json();
        }

        var roosterData=new RoosterData(agendaJSON)



        if(this.props.isWerkgever){
            var object=new StructureData()
            renderdAgendaJSON=object.getRenderdItems(this.state.roosterStructuurData,roosterData,this.state.beginDatum,this.retrurnStructureItem)
            console.log(object)
            this.setState({minTijd:object.minTijd,maxTijd:object.maxTijd})
        }else{
            this.setState({minTijd:roosterData.minTijd,maxTijd:roosterData.maxTijd})
            renderdAgendaJSON=roosterData.getRenderdItems(this.retrurnRenderdItems)
        }

        await this.setState({agendaJSON:{}},() => {
            this.setState({
                agendaJSON:renderdAgendaJSON,
            })
        })
        this.setState({loading:false})
    };


    //Hier Wordt de beginDatum van het rooster veranderd
    //Deze functie wordt gebruikt door de weerkiezer
    changeBeginDatum=(datum:Date)=>{
        return new Promise((resolve => {
                this.setState({beginDatum:datum},()=>{
                    this.refreshRooster();
                    resolve()
                })
            })
        )
    };

    

    updateRoosterStructure=async ()=>{
        const structuur=await fetch(this.props.apiLink+ "/RoosterStructuur/get",{
            headers:{
                authToken:sessionStorage.getItem("authToken")
            }
        })
        const jsonStructuur:roosterStructuurData[]=await structuur.json()
        await this.setState({roosterStructuurData:jsonStructuur})
        this.refreshRooster()
    }





    //Hier wordt gekozen welke items er moeten worden gegenereerd
    retrurnRenderdItems=(value:itemComponentsData,width?:string,startWidth?:string):roosterItemRenderFunc=>{
        return ((roosterData:DagData):ReactElement<RoosterItem>=>{
            return (
                <RoosterItem  roosterData={roosterData} startWidth={startWidth} width={width} beginTijd={new Date(value.beginTijd)} eindTijd={new Date(value.eindTijd)}>
                {/* Hier komen de items in het rooster component*/}
            {
                this.props.isWerkgever?
                    <WerkgeverItem
                        onClick={event => {
                            this.addPopUp(<ItemWijzigen close={this.closePopUp} RoosterData={value} apiLink={this.props.apiLink} />)
                        }}
                        apiLink={this.props.apiLink} itemData={value} />
                    :
                    <WerknemerItem itemData={value}/>
            }

        </RoosterItem>
            )})
    };

    retrurnStructureItem=(value:roosterStructuurItemData,width?:string,startWidth?:string):roosterItemRenderFunc=>{
        return ((roosterData:DagData):ReactElement<RoosterItem>=>{
            return (
                <RoosterItem  roosterData={roosterData} startWidth={startWidth} width={width} beginTijd={new Date(value.beginTijd)} eindTijd={new Date(value.eindTijd)}>
                    <StructureItem onClick={() => {
                        this.addPopUp(<TijdvakWeergeven RoosterData={value} apiLink={this.props.apiLink} close={this.closePopUp} add={this.addPopUp}/> )
                    }} apiLink={this.props.apiLink} {...value}/>
                </RoosterItem>
            )})
    };



    addPopUp=(item:React.ReactElement)=>{
        this.setState(oldState=>{
            oldState.popUpStack.push(item)
            return {popUpStack:oldState.popUpStack}
        })
    }

    closePopUp=()=>{
       this.refreshRooster()
       this.setState(oldState=>{
           oldState.popUpStack.pop()
           return {popUpStack:oldState.popUpStack}
       })
    };

    render() {
        return (
                <div>
                    {
                        this.state.popUpStack.length!==0 &&
                        <PopUp>
                            {this.state.popUpStack[this.state.popUpStack.length-1]}
                        </PopUp>
                    }
                    <div className='row'>
                        <WeekKiezer beginDatum={this.state.beginDatum} changeBeginDatum={this.changeBeginDatum}/>
                      <OptionWithIcon className="Button" onClick={()=>{this.updateRoosterStructure()}} imgClass="onAccentFilter" icon={"refresh-24px.svg"} text={"Refresh"}/>
                        {
                            this.props.isWerkgever &&
                                <div className="row">
                                    <button className="noHorPadding Button onAccent" onClick={event => {
                                        this.setState(oldState=>{
                                            oldState.popUpStack.push(<WerknemerInroosteren apiLink={this.props.apiLink} close={this.closePopUp}/>)
                                            return {popUpStack:oldState.popUpStack}
                                        })
                                    }} ><OptionWithIcon imgClass="onAccentFilter" icon={"person.svg"} text={"Werknemer Inroosteren"}/>
                                    </button>
                                </div>
                        }

                    </div>
                    {/*Rooster Component maakt de rooster structuur waar roosterItems ingaat*/}
                {
                    this.state.loading
                        ?
                        <div className="center">
                            <img src={loadingIcon} width={300} style={{margin: "auto"}}/>
                        </div>
                        :
                        <RoosterComponent
                            startDate={this.state.beginDatum}
                            markerInterval={new Date(0, 0, 0, 0, 30)}
                            beginTijd={this.state.minTijd}
                            eindTijd={this.state.maxTijd}
                            height={600}

                            /*
                            In de prop renderItems worden alle items gemaakt die in het rooster gaan
                            De items worden een object met {datum:genereer functie}
                            In RoosterComponent worden de items verdeeld over de dagen d.m.v. de datum key zie *1
                            In rooster component kan 'html' worden gevoegd zodat het item ook wat uiterlijk heeft
                            Zo kan het roosterComponent ook worden gebruikt voor de baas
                            (let op de roosterItems worden pas in 'DagField echt geplaatst nu zijn ze nog functies
                            */

                            renderItems={this.state.agendaJSON}
                        />
                }
            </div>
        );
    }

}
export default Rooster

