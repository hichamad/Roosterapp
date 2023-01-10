import React from "react";
import {Link} from "react-router-dom";

interface IState{
    RoosterAndPerson:{
        naam:string,
        beginTijd:string,
        eindTijd:string,
        datum:string,
        userId:number
    },
    secondUser:{
        userId:number,
        naam:string
    }
}

interface IProps {
    apiLink:string,
    serverLink:string,
    roosterItemId:number,
    notifId:number,
    messageId:number,
    currentUser:number
}

class ZiekMeld extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state={
            RoosterAndPerson : {
                naam : "" ,
                beginTijd : "" ,
                eindTijd : "" ,
                datum : "",
                userId:null
            },
            secondUser:{
                userId:null,
                naam:""
            }
        }
    }

    componentDidMount() : void{
        this.getRoosterAndPerson()
    }

    acceptZiekmeld = () => {
        console.log("Sending approval item...");
        fetch(this.props.apiLink+'/delNotif', {method:'post',
            headers:{
                authToken:sessionStorage.getItem('authToken'),
                "content-type":"application/json"
            },
            body:JSON.stringify({notifId:this.props.notifId})});
        fetch("http://localhost:5000/api/addnotif", {
            method:"post", headers:{
                "content-type":"application/json"
            }, body:JSON.stringify({
                "person":this.props.currentUser, "messageId":4, "roosterId":1, "roosterItemId":this.props.roosterItemId, "isForBoss":true, "secondUser":this.state.RoosterAndPerson.userId
            })
        });
    };

    deleteSwitch = () => {
        fetch(this.props.apiLink+'/delNotif', {method:'post',
            headers:{
                authToken:sessionStorage.getItem('authToken'),
                "content-type":"application/json"
            },
            body:JSON.stringify({notifId:this.props.notifId})});
        fetch(this.props.apiLink+"/resetState", {method:"post",
            headers:{
                authToken:sessionStorage.getItem('authToken'),
                "content-type":"application/json"
            },
            body:JSON.stringify({roosterItemId:this.props.roosterItemId})})
    };

    acceptApproval = () => {
        console.log('Transferring schedule item to new user...');
        fetch(this.props.apiLink+"/ziekAccept", {method:"post",
            headers:{
                authToken:sessionStorage.getItem("authToken"),
                "content-type":"application/json"
            },
            body: JSON.stringify({secondUser: this.state.RoosterAndPerson.userId, roosterItemId:this.props.roosterItemId})
        });
        console.log("SecondUser: "+ JSON.stringify(this.state.secondUser));
        fetch(this.props.apiLink+'/delNotif', {method:'post',
            headers:{
                authToken:sessionStorage.getItem('authToken'),
                "content-type":"application/json"
            },
            body:JSON.stringify({notifId:this.props.notifId})});
    };

    getRoosterAndPerson = async () => {
        console.log("Getting person and schedule info NOW!");
        fetch(this.props.apiLink+"/getRoosterAndPerson", {method:"post",
            headers:
                {
                    authToken:sessionStorage.getItem("authToken"),
                    "content-type":"application/json"
                },
            body: JSON.stringify({roosterItemId:this.props.roosterItemId})
        })
            .then(
                (u) => {
                    try{
                        return u.json()
                    }
                    catch(error){
                        console.error(error)
                    }
                }
            )
            .then(
                (json) => {
                    console.log(json);
                    this.setState({RoosterAndPerson:json})
                }
            );
        if(this.props.messageId == 4) {
            let secondUser = await fetch(this.props.apiLink+"/getSecondUser", {method:"post",
            headers:
                {
                    authToken:sessionStorage.getItem("authToken"),
                    "content-type":"application/json"
                },
            body: JSON.stringify({notifId:this.props.notifId})
            }).then(res => res.json());
                console.log("secondUser JSON as saved in state BEFORE setState: " +JSON.stringify(this.state.secondUser));
                this.setState({secondUser:secondUser});
                console.log("secondUser JSON as saved in state AFTER setState: " +JSON.stringify(this.state.secondUser))
            }
        };

    render() {
        return (
            <div id="reg">
                <table>
                    <tbody>
                        <tr>
                            <td align={"center"}>
                                {
                                    (this.props.messageId == 1) ?
                                        (this.state.RoosterAndPerson.userId === this.props.currentUser) ?
                                            "Je hebt jezelf ziek gemeld op " + new Date(this.state.RoosterAndPerson.datum).toLocaleDateString("nl-NL", {weekday:"long", day:"numeric", month:"long", year:"numeric"}) + " van " + this.state.RoosterAndPerson.beginTijd.split(":").slice(0,-1).join(":") + " tot " + this.state.RoosterAndPerson.eindTijd.split(":").slice(0,-1).join(":") + ".\n Wil je je ziektemelding annuleren?"
                                            :
                                            this.state.RoosterAndPerson.naam + " heeft zich ziek gemeld, van " + this.state.RoosterAndPerson.beginTijd.split(":").slice(0,-1).join(":") + " tot " + this.state.RoosterAndPerson.eindTijd.split(":").slice(0,-1).join(":") + " op " + new Date(this.state.RoosterAndPerson.datum).toLocaleDateString("nl-NL", {weekday:"long", day:"numeric", month:"long", year:"numeric"}) + ".\nWil je deze dienst overnemen?"
                                        :
                                        (this.props.messageId == 0) ?
                                            (this.state.RoosterAndPerson.userId == this.props.currentUser) ?
                                                "Je hebt om vervanging gevraagd op " + new Date(this.state.RoosterAndPerson.datum).toLocaleDateString("nl-NL", {weekday:"long", day:"numeric", month:"long", year:"numeric"}) + " van " + this.state.RoosterAndPerson.beginTijd.split(":").slice(0,-1).join(":") + " tot " + this.state.RoosterAndPerson.eindTijd.split(":").slice(0,-1).join(":") + ".\n Wil je je aanvraag annuleren?"
                                                :
                                                this.state.RoosterAndPerson.naam + " heeft om vervangig gevraagd, van " + this.state.RoosterAndPerson.beginTijd.split(":").slice(0,-1).join(":") + " tot " + this.state.RoosterAndPerson.eindTijd.split(":").slice(0,-1).join(":") + " op " + new Date(this.state.RoosterAndPerson.datum).toLocaleDateString("nl-NL", {weekday:"long", day:"numeric", month:"long", year:"numeric"}) + ".\nWil je deze dienst overnemen?"
                                            :
                                            (this.props.messageId == 4) ?
                                                this.state.RoosterAndPerson.naam + " wil de dienst van " + this.state.secondUser["naam"] + " overnemen, van " + this.state.RoosterAndPerson.beginTijd.split(":").slice(0,-1).join(":")  + " tot " + this.state.RoosterAndPerson.eindTijd.split(":").slice(0,-1).join(":") + " op " + new Date(this.state.RoosterAndPerson.datum).toLocaleDateString("nl-NL", {weekday:"long", day:"numeric", month:"long", year:"numeric"}) + ".\nWil je hier goedkeuring voor geven?"
                                                :
                                                '[ERROR: Ongeldig messageId]'
                                }
                            </td>
                        </tr>
                        <tr>
                            <Link to={(this.state.RoosterAndPerson.userId == this.props.currentUser) ? "/OvernameFeedback/"+ 2 + "/" + true : (this.props.messageId != 4) ? "/OvernameFeedback/" + 1 + "/" + true : "/OvernameFeedback/" + 0 + "/" + true}><button className="Button" onClick={(this.state.RoosterAndPerson.userId == this.props.currentUser) ? this.deleteSwitch : (this.props.messageId != 4) ? this.acceptZiekmeld : this.acceptApproval}>Ja</button></Link>
                            <Link to={(this.state.RoosterAndPerson.userId == this.props.currentUser) ? "/OvernameFeedback/"+ 2 + "/" + false : (this.props.messageId != 4) ? "/OvernameFeedback/" + 1 + "/" + false : "/OvernameFeedback/" + 0 + "/" + false}><button className="Button" onClick={(this.props.messageId != 4) ? null : this.deleteSwitch}>Nee</button></Link>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default ZiekMeld