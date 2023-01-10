import React from 'react'
import {TimeMarkerTypes} from "./TimeMarkerTypes";

interface IProps {
    beginTijd:Date
    eindTijd:Date
    interval:Date
    hourHeight:number
    lengte:number
    type:TimeMarkerTypes
    verticaal?:boolean
}

interface IState {
    uren:{tijd:Date,y:number}[]
    beginTijd:null,
    eindTijd:null
}
class TimeMarker extends React.Component<IProps,IState>{

    constructor(props:IProps){
        super(props);
        this.state={
            uren:[],
            beginTijd:null,
            eindTijd:null
        }
    }

    componentDidMount(): void {
        this.updateLijnen()
    }

    componentDidUpdate(prevProps:Readonly<IProps>, prevState:Readonly<IState>, snapshot?:any) {
        if(prevProps!==this.props){
            //Hier wordt een lijst gemaakt met alle uren om weer te geven (i.p.v. uren kan er ook een lijn worden weergegeven)
           this.updateLijnen()
        }
    }

    updateLijnen=()=>{
        var lijst=[{tijd:this.props.beginTijd.toTime(),y:0}];
        var interval=this.props.interval.toTime();
        for(let i=1;new Date(lijst[i-1].tijd.getTime()+interval.getTime()).getTime()<=this.props.eindTijd.toTime().getTime();i++){
            lijst.push({tijd:new Date(lijst[i-1].tijd.getTime()+interval.getTime()),y:lijst[i-1].y+(this.props.hourHeight*(interval.getTime()/1000/60/60))})
        }
        this.setState({uren:lijst})
    }

    //Deze functie zorgt ervoor dat de datum niet meeteld bij getTime on je bij 00:00:00 ook 0 ms krijgt
    makeDateZero(date:number){
        return new Date(new Date(1970,0,1,1).getTime()+date)
    }

    render() {
        return(
            <div className={this.props.verticaal && "row"} style={this.props.verticaal?{width:this.props.lengte,position:"relative",minHeight:25}:{height:this.props.lengte,position:"relative",minWidth:50}}>
                {
                    // Hier worden voor alle tijden of lijnen op de uren geplaatst
                    this.state.uren.map((value,index,list) =>{
                        var item=<div/>;
                    var data:React.CSSProperties
                    if(this.props.verticaal){
                        data={position:"absolute",left:value.y,top:0,textAlign:"center",margin:0};
                    }else{
                        data={position:"absolute",left:0,top:value.y,textAlign:"center",margin:0};
                    }

                    //Hier wordt gedefineerd of er een lijn of een tijd wordt weergegeven
                    if (this.props.type===TimeMarkerTypes.line){
                        if(index!==0 && index!==list.length-1) {
                            Object.assign(data, this.props.verticaal?{marginLeft:-2}: {marginTop: -2});
                            item = <div className={this.props.verticaal?"lineMarkerVerticaal":"lineMarkerHorizontaal"} style={data}/>
                        }
                    }else{
                        Object.assign(data,this.props.verticaal?{marginLeft:-35/2,height:"100%"}:{marginTop:-24/2,width:"100%"});
                        item=<p style={data}>{value.tijd.toLocaleTimeString('nl-NL',{hour:"2-digit",minute:"2-digit",timeZone:"UTC"})}</p>
                    }
                    return item
                })}
            </div>
        )
    }
}
export default TimeMarker