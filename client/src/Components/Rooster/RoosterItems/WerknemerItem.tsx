import React                           from 'react'
import {ReactComponent as MoreOptions} from "../../../icons/more_horiz-24px.svg";
import OptionWithIcon                  from "../../OptionWithIcon";
import { Link }                        from "react-router-dom";
import { itemComponentsData }          from "../Rooster Classes/roosterData";


interface IProps {
    itemData:itemComponentsData
}

class WerknemerItem extends React.Component<IProps> {
    ziekMelden=(messageType:number)=>{
        console.log(this.props.itemData);
        if(this.props.itemData.UserData[0].status==1) {
            fetch("http://localhost:5000/api/addnotif", {
                method:"post", headers:{
                    "content-type":"application/json"
                }, body:JSON.stringify({
                    "person":this.props.itemData.UserData[0].userId, "messageId":messageType, "roosterId":1, "roosterItemId":this.props.itemData.UserData[0].itemId, "isForBoss":false
                })
            });
            fetch("http://localhost:5000/api/ziekMeld", {
                method:'post', headers:{
                    'content-type':'application/json', 'authToken':sessionStorage.getItem('authToken')
                }, body:JSON.stringify({"roosterItemId":this.props.itemData.UserData[0].itemId, "status":(messageType == 0) ? 2 : 3})
            });
        } else {
            console.log('Bad status '+this.props.itemData.UserData[0].status)
        }
    };

    render() {
        return (<div className="column isideItem">
                <div className="row">
                    <p className="onAccent noMargin">{new Date(this.props.itemData.beginTijd).toLocaleTimeString("nl-NL", {
                        hour:"2-digit", minute:"2-digit"
                    })}-{new Date(this.props.itemData.eindTijd).toLocaleTimeString("nl-NL", {
                        hour:"2-digit", minute:"2-digit"
                    })}</p>
                    <details className="chooseMenu right">
                        <div>
                            <Link to={'ZiekmeldFeedback'}><OptionWithIcon icon="people-24px.svg" text="Vervanging regelen"
                                                                          onClick={()=>this.ziekMelden(0)}/></Link>
                            <Link to={'ZiekmeldFeedback'}><OptionWithIcon icon="local_hospital-24px.svg" text="Ziek melden"
                                                                          onClick={()=>this.ziekMelden(1)}/></Link>
                        </div>
                        <summary>
                            <MoreOptions width={35} height={35} className="onAccent right"/>
                        </summary>
                    </details>
                </div>
            </div>)
    }
}

export default WerknemerItem