import React from 'react'
import TimeMarker from "./TimeMarker";
import {TimeMarkerTypes} from "./TimeMarkerTypes";
import {dayRenderItem} from "../Rooster Classes/roosterData";




export interface IProps {
    renderItems:dayRenderItem
    markerInterval:Date
    eindTijd:Date
    beginTijd:Date
    hourHeight:number
    lengte:number
    verticaal?:boolean
}

export type DagData=Omit<IProps,'renderItems'>

class DagField extends React.Component<IProps>{
    render() {
        return(
            <div>
                <div className="DagField" style={this.props.verticaal?{width:this.props.lengte,height:50}:{height:this.props.lengte}}>
                    <div className="DagLijnen absolute">
                        <TimeMarker verticaal={this.props.verticaal} interval={this.props.markerInterval} beginTijd={this.props.beginTijd} eindTijd={this.props.eindTijd} hourHeight={this.props.hourHeight} lengte={this.props.lengte} type={TimeMarkerTypes.line}/>
                    </div>
                    <div className="Items absolute">
                        {
                            // Hier wordt het rooster items echt uitgevoerd en geplaasts
                            Object.values(this.props.renderItems).map(value => {
                                return value(this.props)
                            })

                        }
                    </div>
                </div>
            </div>
        )
    }

}
export default DagField