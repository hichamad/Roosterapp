import React from 'react'
import Functions from "../../Extra Functions/functions";
import {ReactComponent as NextIcon} from "../../icons/arrow_next.svg";
import {ReactComponent as BackIcon} from "../../icons/arrow_back.svg";


interface IState {
    week:number
    year:number
    kiesbareWeken:number[]
    kiesbareJaren:number[]
}
interface IProps {
    beginDatum:Date
    changeBeginDatum:(date:Date)=>Promise<unknown>
}


class WeekKiezer extends React.Component<IProps,IState>{
    constructor(props:IProps){
        super(props);
       this.state={
            week:1,
           year:2019,
           kiesbareWeken:Functions.range(52,1),
           kiesbareJaren:Functions.range(new Date().getFullYear(),2000)
       };
    }

    handleInputChange=(event:React.ChangeEvent<HTMLSelectElement>)=> {
        const target = event.target;
        var value: string|boolean|number = target.value;
        const name = target.name;
        if((name==="week"||name==="year")&&typeof value!=="boolean"){
            value=parseInt(value)
        }
        this.setState<never>({[name]:value}, this.updateDate  )

    }

    changeWeek=(amount:number)=>{
        var week=this.state.week;
        var year=this.state.year;

        week+=amount;
        if (week>52){
            week=week-52;
            year+=1
        }else if (week<1){
            week=52-week;
            year-=1
        }
        this.setState({week:week,year:year},this.updateDate)
    };

    updateDate=()=>{
        this.props.changeBeginDatum(Functions.getDateOfISOWeek(this.state.week,this.state.year))
    };

    changeToMonday=(date:Date)=>{
        var amountBack=0;
        if(date.getDay()===0){
            amountBack=6
        }else{
            amountBack = date.getDay()-1
        }
        return new Date(date.getFullYear(),date.getMonth(),date.getDate()-amountBack)
    };

    updateSelects=()=>{
        this.setState({year:this.props.beginDatum.getFullYear(),week:this.props.beginDatum.getWeekNumber()})
    };

    componentDidMount() {
        // Als de ingevoederde datum geen maandag is wordt deze meteen omgezet naar de maandag in de week
            this.props.changeBeginDatum(this.changeToMonday(this.props.beginDatum));
        this.updateSelects()
    }

    render() {
        return(
            <div className="row WeekKiezer">
                <select name="week"  value={this.state.week} onChange={ this.handleInputChange}>
                        {this.state.kiesbareWeken.map((value)=><option style={{backgroundColor:this.state.week===value? "lightgray":undefined}} value={value}  >Week {value} {Functions.getDateOfISOWeek(value,this.state.year).toLocaleDateString("nl-NL",{day:"numeric",month:"short"})} </option> )}
                </select>
                <select name="year"  value={this.state.year} onChange={this.handleInputChange}>
                        {this.state.kiesbareJaren.map((value)=><option style={{backgroundColor:this.state.year===value? "lightgray":undefined}} value={value} >{value}</option> )}
                </select>
                <BackIcon onClick={()=>this.changeWeek(-1)}/>
                <NextIcon onClick={()=>this.changeWeek(1)}/>
                <button className="Button" onClick={()=>{
                    this.props.changeBeginDatum(this.changeToMonday(new Date())).then(()=>{
                        this.updateSelects()
                    })

                }}>Deze week</button>
            </div>
            )

    }
}
export default WeekKiezer