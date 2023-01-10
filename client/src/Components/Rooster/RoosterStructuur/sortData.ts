import {BeginEindTijd} from "../Rooster Classes/roosterData"

export interface sortedData<Data> {
    [data:string]:{[beginEindTijd:string]:Data}
}

export function sortDataOnTime<Data>(data:(Data & {beginTijd:string,eindTijd:string,datum:string})[]):sortedData<Data> {
    var returnObject:sortedData<Data>={};
    data.forEach(value => {
        if(value.datum in returnObject){
            var datumVak=returnObject[value.datum];
            var tijd=BeginEindTijd.createBeginEindTijd(value.beginTijd,value.eindTijd)
            datumVak[tijd]=value
        }else{
            returnObject[value.datum]={[BeginEindTijd.createBeginEindTijd(value.beginTijd,value.eindTijd)]:value}
        }
    });
    return returnObject
}
