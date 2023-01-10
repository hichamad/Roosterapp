class Functions{

    static  timeStringToDate = (timeString:string):Date=>{
        var timeList = timeString.split(":")
        var date=new Date(0,0,0,parseInt(timeList[0]),parseInt(timeList[1]),parseInt(timeList.length>2?timeList[2]:"0"))
        return date
    }


    static range = (max:number,min?:number):number[] => {

        var lijst= Array.from(Array(max+1-(min||0)).keys())

        if(min){
            lijst=lijst.map(value => value+min)
        }
        return lijst
    }

    static addZeros=(value:number,amount:number):String=>{
        return ("0".repeat(amount-value.toString().length)+value)
    }

    static getDateOfISOWeek=(week:number, year:number):Date=> {
        var simple = new Date(year, 0, 1 + (week - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }
}
export default Functions