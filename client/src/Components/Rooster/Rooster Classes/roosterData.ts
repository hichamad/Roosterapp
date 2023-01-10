import {DagData} from "../RoosterStructuur/DagField";
import {ReactElement} from "react";
import RoosterItem from "../RoosterItems/RoosterItem";


export interface itemComponentsData { beginTijd: string, eindTijd: string, datum: string, UserData: { naam: string, userId: number,itemId:number,status:number }[] }
export interface roosterItem { datum: string, beginTijd: string, eindTijd: string, userId: number, naam: string,itemId:number, status:number }
export interface UserData {
naam: string, userId: number,itemId:number,status:number
}
export type itemValues={ naam: string, userId: number }[]
export interface formatedDayItem { [tijd: string]: { naam: string, userId: number,itemId:number, status:number }[] }
export interface formatedRoosterItems{ [datum: string]: formatedDayItem }
export type roosterItemRenderFunc =(RoosterData: DagData) => ReactElement<RoosterItem>
export interface dayRenderItem { [tijd: string]: roosterItemRenderFunc }
export interface fullRenderItem{ [datum: string]: dayRenderItem }


export class BeginEindTijd{
    public beginTijd:Date;
    public eindTijd:Date;
    public beginTijdWaarde:number;
    public eindTijdWaarde:number;


    static createBeginEindTijd(beginTijd:string,eindTijd:string){
        return beginTijd+";"+eindTijd
    }
    constructor(beginEindTijd:string){
        const gesplitst=beginEindTijd.split(";");
        this.beginTijd=new Date(gesplitst[0]);
        this.eindTijd=new Date(gesplitst[1]);
        this.beginTijdWaarde=this.beginTijd.getTime();
        this.eindTijdWaarde=this.eindTijd.getTime()
    }



    public getLength(){
        return this.eindTijdWaarde-this.beginTijdWaarde
    }
}


class RoosterData {
    public data:formatedRoosterItems;
    public maxTijd:Date=new Date(0,0,0,20);
    public minTijd:Date=new Date(0,0,0,7);

    constructor(data:roosterItem[]) {
        this.data=this.sortOnSameTime(data.slice())
    }

    //Deze functie kijk of lijst1 een sublijst van lijst2 is
    private isSubListOf2=(list1:number[],list2:number[])=>{
        return list1.every(value => list2.includes(value))
    };

    //Deze functie maakt lijsten met alle intersectie die er zijn
    getInterSecties(itemIndexLijst:string[]):number[][]{
        var allIntersecties:number[][] = [];

        itemIndexLijst.forEach((value1, index) => {
            var tijden1=new BeginEindTijd(value1);
            var lijst: number[]=[index];
            itemIndexLijst.forEach(((value2, index2) => {
                if(index!==index2){
                    var tijden2=new BeginEindTijd(value2);
                    var isIntersect=false;
                    if(!(tijden1.beginTijdWaarde>=tijden2.eindTijdWaarde||tijden1.eindTijdWaarde<=tijden2.beginTijdWaarde)){
                        lijst.push(index2)
                    }
                }
            }));
            if(!allIntersecties.some(value2 => value2.equals(lijst.sort()))){
                allIntersecties.push(lijst.sort())
            }
        });

        return allIntersecties.filter((value1, index) => {
            return !allIntersecties.some((value2, index1) => {
                return (index === index1 ? false : this.isSubListOf2(value2, value1))
            })
        })
    }

    styleItemObject(gesorteerdeItems:number[],intersecties:number[][]):({[id:string]:{width:number,start:number}}){
        var itemStyleData:{[id:string]:{width:number,start:number}}={};
        gesorteerdeItems.forEach(value1 => {
            var intersections=intersecties.filter(value2 => value2.includes(value1));
            if(intersections.length!==0){
                var intersectionLengthSort=intersections.sort((a, b) => b.length-a.length);
                var maxIntersection=intersectionLengthSort[0];

                var shareAmount=maxIntersection.length;
                var reserverdWidth=maxIntersection.reduce((previousValue, currentValue) => {
                    var addValue=0;
                    if(itemStyleData[currentValue]){
                        shareAmount-=1;
                        addValue=itemStyleData[currentValue].width
                    }
                    return previousValue+addValue
                },0);

                var width=(100-reserverdWidth)/shareAmount;
                itemStyleData[value1]={width:width,start:reserverdWidth}
            }
        });
        return itemStyleData
    }




    //Hier wordt json omgezet naar items die kunnen worden gerenderd
    //Hier wordt ook gekozen of ze naast elkaar moeten komen of niet
    public getRenderdItems(returnRender:((value:itemComponentsData,width?:string,startWidth?:string)=>roosterItemRenderFunc)):fullRenderItem{
        var formatJson:any=Object.assign({},this.data);

        Object.keys(formatJson).forEach(value => {
            const datumJSON=this.data[value];
            var ObjectList=Object.keys(formatJson[value]);

            var intersecties=this.getInterSecties(ObjectList);

            var amountOfIntersecties:{[id:string]:number}={};
            var indexen:number[]=[];
            ObjectList.forEach((value1,index) => {
                indexen.push(index);
                amountOfIntersecties[index.toString()]=intersecties.reduce((previousValue, currentValue) => previousValue+(currentValue.includes(index)?1:0),0)
            });

            indexen.sort((a, b) => {
                const tijda=new BeginEindTijd(ObjectList[a]);
                const tijdb=new BeginEindTijd(ObjectList[b]);
                return tijdb.getLength()-tijda.getLength()
            });

            var itemSort=indexen.sort((a, b) => amountOfIntersecties[b]-amountOfIntersecties[a]);

            var itemStyleData=this.styleItemObject(itemSort,intersecties);

            ObjectList.forEach((value1, index) => {
                const gesplitst=value1.split(";");
                const beginTijd=gesplitst[0];
                const eindTijd=gesplitst[1];
                const values=formatJson[value][value1];
                formatJson[value][value1]=returnRender({beginTijd:beginTijd,eindTijd:eindTijd,datum:value,UserData:values},itemStyleData[index]&&itemStyleData[index].width+"%",itemStyleData[index]&&itemStyleData[index].start+"%")
            })
        });
        return formatJson
    };

    private beginEindString=(beginTijd:string,eindTijd:string):string=>{
        return beginTijd+";"+eindTijd
    };

    //Hier wordt de json die binnenkomt van de server omgezet naar json die door het rooster wordt gebruikt
    //Ook worden hier items die op dezelde tijd is samengevoegd
    private sortOnSameTime=(json:roosterItem[]):formatedRoosterItems=>{
        var returnObject:formatedRoosterItems={};
        json.forEach(value => {
            if(value.datum in returnObject){
                var datumVak=returnObject[value.datum];
                if(this.beginEindString(value.beginTijd,value.eindTijd) in datumVak){
                    var tijdVak=datumVak[this.beginEindString(value.beginTijd,value.eindTijd)];
                    tijdVak.push({userId:value.userId,naam:value.naam,itemId:value.itemId, status:value.status})
                }else{
                    if(new Date(value.beginTijd).getTime()<this.minTijd.getTime()){
                        this.minTijd=new Date(value.beginTijd)
                    }
                    if(new Date(value.eindTijd).getTime()>this.maxTijd.getTime()){
                        this.maxTijd=new Date(value.eindTijd)
                    }
                    datumVak[this.beginEindString(value.beginTijd,value.eindTijd)]=[{userId:value.userId,naam:value.naam,itemId:value.itemId, status:value.status }]
                }
            }else{
                if(new Date(value.beginTijd).getTime()<this.minTijd.getTime()){
                    this.minTijd=new Date(value.beginTijd)
                }
                if(new Date(value.eindTijd).getTime()>this.maxTijd.getTime()){
                    this.maxTijd=new Date(value.eindTijd)
                }
                returnObject[value.datum]={[this.beginEindString(value.beginTijd,value.eindTijd)]:[{userId:value.userId,naam:value.naam,itemId:value.itemId, status:value.status}]}
            }

        });
        return returnObject
    };


    private sortOnData=(json:roosterItem[]):formatedRoosterItems=>{
        var returnObject:formatedRoosterItems={};
        json.forEach(value => {
            if(value.datum in returnObject){
                var datumVak=returnObject[value.datum];
                if(this.beginEindString(value.beginTijd,value.eindTijd) in datumVak){
                    var tijdVak=datumVak[this.beginEindString(value.beginTijd,value.eindTijd)];
                    tijdVak.push({userId:value.userId,naam:value.naam,itemId:value.itemId,status:value.status})
                }else{
                    if(new Date(value.beginTijd).getTime()<this.minTijd.getTime()){
                        this.minTijd=new Date(value.beginTijd)
                    }
                    if(new Date(value.eindTijd).getTime()>this.maxTijd.getTime()){
                        this.maxTijd=new Date(value.eindTijd)
                    }
                    datumVak[this.beginEindString(value.beginTijd,value.eindTijd)]=[{userId:value.userId,naam:value.naam,itemId:value.itemId,status:value.status}]
                }
            }else{
                if(new Date(value.beginTijd).getTime()<this.minTijd.getTime()){
                    this.minTijd=new Date(value.beginTijd)
                }
                if(new Date(value.eindTijd).getTime()>this.maxTijd.getTime()){
                    this.maxTijd=new Date(value.eindTijd)
                }
                returnObject[value.datum]={[this.beginEindString(value.beginTijd,value.eindTijd)]:[{userId:value.userId,naam:value.naam,itemId:value.itemId,status:value.status}]}
            }

        });
        return returnObject
    };

}export default RoosterData