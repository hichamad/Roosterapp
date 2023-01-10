import React from 'react'
import {DagData} from "../RoosterStructuur/DagField";

interface IState {
    top:number
    length:number
}

interface IProps {
    width?:string
    startWidth?:string
    beginTijd:Date
    eindTijd:Date
    roosterData:DagData
}

class RoosterItem extends React.Component<IProps,IState>{
    constructor(props:IProps){
        super(props);
        this.state={
            top:0,
            length:0
        }
    }

    componentDidMount() {
        this.setState({length:this.calcHeightfromHours(this.props.beginTijd,this.props.eindTijd),top:this.calcHeightfromHours(this.props.roosterData.beginTijd,this.props.beginTijd)})

    }

    calcHeightfromHours(beginTijd:Date,eindTijd:Date){
        var miliseconden=eindTijd.getTime()-beginTijd.getTime();
        var aantalUur=miliseconden/1000/60/60;
        return this.props.roosterData.hourHeight*aantalUur
    }

    render() {

        return(
            <div  className="absolute roosterItem" style={this.props.roosterData.verticaal?{left:this.state.top,width:this.state.length,maxWidth:this.state.length,top:this.props.startWidth||0,height:this.props.width||50}:{top:this.state.top,height:this.state.length,maxHeight:this.state.length,left:this.props.startWidth||0,width:this.props.width||"100%"}}>
                {this.props.children}
            </div>
        )
    }
}
export default RoosterItem