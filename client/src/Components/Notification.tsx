import React from "react"
import {Link} from "react-router-dom";

interface IProps {
    person:string
    messageId:number
    imageLink:string
    apiLink:string
    roosterItemId:number
    notifId:number
}

class NotificationItem extends React.Component<IProps> {
    delNotif() {
        fetch(this.props.apiLink+'/delNotif', {method:'post',
            headers:{
                authToken:sessionStorage.getItem('authToken'),
                "content-type":"application/json"
            },
            body:JSON.stringify({notifId:this.props.notifId})});
    }
    render() {
        let messages = [" wil voor een dienst vervangen worden.", " heeft zich ziek gemeld.", " heeft je vervangingsaanvraag afgekeurd.", " heeft je rooster bijgewerkt.", " wil goedkeuring voor een dienstruil."];
        return (
            <Link onClick={() => {if (this.props.messageId == 2 || this.props.messageId == 3) {
                this.delNotif()
            }}} to={
                (this.props.messageId == 0 || this.props.messageId == 1) ?
                    "/ZiekMeld/"+this.props.roosterItemId+"/"+this.props.notifId + "/" + this.props.messageId
                    :
                    (this.props.messageId == 2) ?
                        "/Rooster"
                        :
                        (this.props.messageId == 4) ?
                            "/ZiekMeld/"+this.props.roosterItemId+"/"+this.props.notifId + "/" + this.props.messageId
                            :
                            "/Rooster"
            } >
                <div className='NotifItem'>
                    <img className='avatar' src={this.props.imageLink.length>0 && this.props.apiLink+"/avatar/"+ this.props.imageLink} alt='profielfoto'/>
                    <p>{this.props.person}{messages[this.props.messageId]}</p>
                </div>
            </Link>
        )
    }
}

export default NotificationItem