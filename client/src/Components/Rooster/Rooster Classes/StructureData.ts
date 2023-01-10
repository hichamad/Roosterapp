import Functions from "../../../Extra Functions/functions";
import {sortDataOnTime, sortedData} from "../RoosterStructuur/sortData";
import RoosterData, {BeginEindTijd, roosterItemRenderFunc} from "./roosterData";
import {roosterStructuurData} from "../../../Pages/Rooster";


class StructureData{
    public maxTijd:Date=new Date(0,0,0,20)
    public minTijd:Date=new Date(0,0,0,7)

    public getRenderdItems(structuurData:roosterStructuurData[],roosterData:RoosterData,beginDatum:Date,retrurnStructureItem:((value:roosterStructuurData & { datum: string; beginTijd: string; eindTijd: string; werknemers: any[] },width?:string,startWidth?:string)=>roosterItemRenderFunc)){
        var copyData=structuurData.map(value => Object.assign({},value))
        var minBeginTijd=Math.min(...copyData.map(value => Functions.timeStringToDate(value.beginTijd).getTime()))
        var maxEindTijd=Math.max(...copyData.map(value => Functions.timeStringToDate(value.eindTijd).getTime()))

        console.log(minBeginTijd)
        console.log(maxEindTijd)

        if(minBeginTijd<this.minTijd.getTime()){
            this.minTijd= new Date(minBeginTijd)
        }

        if(maxEindTijd>this.maxTijd.getTime()){
            this.maxTijd= new Date(maxEindTijd)
        }

        var sturctureData= copyData.map(value => {
            var amountToAdd=(((value.dagNummer-1)%7)+7)%7
            var datum=new Date(beginDatum.getTime()+amountToAdd*86400000)
            var beginTijd=Functions.timeStringToDate(value.beginTijd).toJSON()
            var eindTijd=Functions.timeStringToDate(value.eindTijd).toJSON()
            var data=Object.assign(value,{datum:datum.toJSON(),werknemers:[],beginTijd:beginTijd,eindTijd:eindTijd})
            return data
        })
        var itemsInTheWeek=sortDataOnTime(sturctureData)
        Object.keys(itemsInTheWeek).forEach(value => {
            var tijdItems=itemsInTheWeek[value]
            var roosterItems=roosterData.data[value]
            Object.keys(tijdItems).forEach(value1 => {
                var tijd=value1
                //Er komen geen structuur items tegelijkertijd
                var item=tijdItems[tijd]
                if(roosterItems !== undefined){
                    var werknemersLijst=Object.entries(roosterItems)

                    var tijden1=new BeginEindTijd(tijd)
                    werknemersLijst.forEach(value2 => {
                        var tijden2=new BeginEindTijd(value2[0])
                        if(!(tijden1.beginTijdWaarde>=tijden2.eindTijdWaarde||tijden1.eindTijdWaarde<=tijden2.beginTijdWaarde)){
                            value2[1].forEach(value3 => {
                                item.werknemers.push({beginTijd:tijden2.beginTijd,eindTijd:tijden2.eindTijd,userId:value3.userId,itemId:value3.itemId,naam:value3.naam})
                            })
                        }
                    })
                }
            })
        })

        console.log(itemsInTheWeek)
        var itemsInTheWeekRender=Object.assign({},itemsInTheWeek)
        var renderObject:sortedData<roosterItemRenderFunc>={}
        Object.entries(itemsInTheWeekRender).forEach(value => {
                renderObject[value[0]]={}
                Object.entries(value[1]).forEach(value1 => {
                    console.log(value[1])
                    renderObject[value[0]][value1[0]]=retrurnStructureItem(value1[1])
                })
            }
        )
        return renderObject
    }

}
export default StructureData
