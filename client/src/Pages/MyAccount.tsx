import React from 'react'
import User from "../Components/User"
import "../Components/User";
var API_LINK='http://localhost:5000/api';

interface IState {
    content:{firstName:string,lastName:string,email:string,phone:string,pass:string,birth:string,profielFotoLink:string}[],
    firstName: string,
    lastName:string,
    email: string,
    phone: string,
    pass: string,
    birth: string,
    profielFotoLink: string,
    isWerkgever: string
}

interface IProps {
    apiLink:string
    serverLink:string
}
class MyAccount extends React.Component<IProps,IState>{
    lijst:string[];

    constructor(props:IProps){
        super(props);
        this.state={
            content:[],
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            pass: "",
            birth: "",
            profielFotoLink: "",
            isWerkgever: ""
        };
        this.lijst=["firstName","lastName","email","phone","pass","birth","profielfoto","isWerkgever"];
        this.refreshData=this.refreshData.bind(this)
    }

    refreshData= async ()=>{
        console.log("get data");
        var request= await fetch(this.props.apiLink+"/getgebruikerinfo",{headers:{authToken:sessionStorage.getItem("authToken")}});
        var json= await request.json();
        console.log(json);
        this.setState({
                          content:json
                      })};

    componentDidMount= async ()=> {
        this.refreshData()
    };

    render() {
        return(
            <div>
                <div className="underlay">
                    <h1><span className="weighted">{this.state.content.length>0 && this.state.content[0].firstName}'s</span> account informatie</h1>
                </div>

                {this.state.content.map(value =>{ return<User serverLink={this.props.serverLink}
                                                              firstName={value.firstName}
                                                              lastName={value.lastName}
                                                              mail={value.email}
                                                              telefoon={value.phone}
                                                              wachtwoord={value.pass}
                                                              geboorte={value.birth}
                                                              avatar={value.profielFotoLink} apiLink={this.props.apiLink}/>})}
            </div>
        )
    }
}
export default MyAccount