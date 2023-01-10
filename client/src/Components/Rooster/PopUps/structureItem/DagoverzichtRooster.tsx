import React from 'react'
import DagField from "../../RoosterStructuur/DagField";
import TimeMarker from "../../RoosterStructuur/TimeMarker";
import '../../Rooster.css'
import LosItemWijzigen, {changeHigerStateFunc} from "../Normaal Item/LosItemWijzigen";
import {dayRenderItem, roosterItemRenderFunc, UserData} from "../../Rooster Classes/roosterData";
import {TimeMarkerTypes} from "../../RoosterStructuur/TimeMarkerTypes";


interface IProps {
    eindTijd:Date
    beginTijd: Date
    width:number
    apiLink:string
    markerInterval:Date
    changeHigherState:changeHigerStateFunc
    addPopUp:(component:React.ReactElement)=>void
    closePopUp:()=>void
    renderItems:WerknemerRenderObject[]
}

export interface WerknemerRenderObject extends UserData{
    naam:string
    userId:number
    itemId:number
    beginTijd:Date
    eindTijd:Date
    function:roosterItemRenderFunc
}




class DagoverzichtRooster extends React.Component<IProps>{



    render() {
        var items:dayRenderItem={}
        // Hier wordt berekend hoeveel pixels 1 uur is
        var hourHeight=this.props.width/((this.props.eindTijd.getHours()+this.props.eindTijd.getMinutes()/60)-(this.props.beginTijd.getHours()+this.props.beginTijd.getMinutes()/60));

        return(

            <div>
                <div >
                    <tbody>
                        <tr>
                        {/*Hier wordt de zijkant met de tijden gegenereerd  */}
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        <td>
                            <TimeMarker verticaal={true} type={TimeMarkerTypes.time} interval={this.props.markerInterval} beginTijd={this.props.beginTijd} eindTijd={this.props.eindTijd} hourHeight={hourHeight} lengte={this.props.width} />
                        </td>
                        </tr>
                        {
                            Object.entries(this.props.renderItems).map((value,index) =>{
                                var data=value[1]
                                return (<LosItemWijzigen index={index} itemId={data.itemId} userId={data.userId} naam={data.naam} beginTijd={data.beginTijd.toLocaleTimeString()} eindTijd={data.eindTijd.toLocaleTimeString()} apiLink={this.props.apiLink} changeHigherState={this.props.changeHigherState} >
                                    <DagField renderItems={
                                        // *1 Hier worden alle roosterItems verdeeld over de dagen d.m.v. de datum die in het object stond
                                        //this.props.renderItems[value.toISOString()]||{}
                                        {ditMoet:value[1].function}
                                    } beginTijd={this.props.beginTijd} eindTijd={this.props.eindTijd} hourHeight={hourHeight} verticaal={true} lengte={this.props.width} markerInterval={this.props.markerInterval}/>
                                </LosItemWijzigen>)
                                }
                            )


                        }
                    </tbody>
                </div>
            </div>
            )
    }
}

export default DagoverzichtRooster