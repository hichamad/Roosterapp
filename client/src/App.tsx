import React from 'react';
import './App.css';
import {BrowserRouter,Switch,Route} from "react-router-dom";
import Menu from "./Components/Menu/Menu";
import Registratie from "./Pages/Registratie";
import RegistratieFeedback from "./Pages/RegistratieFeedback";
import EmailVerificatie from "./Pages/EmailVerificatie";
import addFunctions from "./Extra Functions/addFunctions";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import MyAccount from "./Pages/MyAccount";
import * as jsonwebtoken from 'jsonwebtoken';
import loadingIcon from "./img/Loding-Icon-zwart.gif";

import WerknemerItem from "./Components/Rooster/RoosterItems/WerknemerItem";
import WerknemersOverzicht from "./Pages/WerknemersOverzicht";

import ZiekMeld         from "./Pages/ZiekMeld";
import Rooster          from "./Pages/Rooster";
import ZiekmeldFeedback from "./Pages/ZiekmeldFeedback";
import OvernameFeedback from "./Pages/OvernameFeedback";


export interface IState {
    apiLink:string
    serverLink:string
    loggedIn:boolean
    logoutTimeout:number
    loading:boolean
    exp:number
    isWerkgever:boolean
    avatar:string
    naam:string
    id:number
}


class App extends React.Component<{},IState>{
  constructor(props:object) {
      super(props);
      var options = ["http://145.24.222.80:5000", "http://localhost:5000"];
      var server= options[1];
      this.state = {
          apiLink: server+"/api",
          serverLink:server,
          exp:0,
          loggedIn:false,
          logoutTimeout:null,
          loading:false,
          isWerkgever:false,
          avatar:"",
          naam:"",
          id:null
      };
      // this programm adds new string functions
      addFunctions()
  }

  componentDidMount=async ():Promise<void>=> {
      this.setState({loading:true});
      await this.updateAuth();
      if(this.state.loggedIn){
          this.updateUserData()
      }
      this.setState({loading:false})
  };




  getUserData= async ()=>{
      var result = await fetch(this.state.apiLink+"/getgebruikerinfo",
          {headers:
                  {"authToken":sessionStorage.getItem("authToken")}
          });
      var resultJSON= (await result.json())[0];

      return {avatar:this.state.apiLink+"/avatar/"+resultJSON.profielFotoLink,naam:resultJSON.firstName+" "+resultJSON.lastName}
  };

  updateUserData=async ()=>{
      this.setState(await this.getUserData())
  };

  getJWTOjbect=(jwt:string)=>{
      const jwtObject=jsonwebtoken.decode(jwt);
      console.log(jwtObject);
      if(typeof jwtObject!=="string"){
          jwtObject.exp=jwtObject.exp-60;
          return jwtObject
      }
      return null
  };

  updateStateFromJWT=(jwt:string)=>{
      this.setState<never>(this.getJWTOjbect(jwt))
  };

  updateAuth=async ()=>{
      console.log("update");
      const refreshToken=localStorage.getItem("refreshToken");
      const authToken=sessionStorage.getItem("authToken");
      if(authToken!==null){
          this.updateStateFromJWT(authToken)
          this.setState({loggedIn:true});
      }else if(refreshToken!==null){
              const result=await fetch(this.state.serverLink+"/auth/refresh",{
                  headers:{
                      refreshToken:refreshToken
                  }
              });
              const status=result.status;
              if(status===200){
                  var tekst=await result.text();
                  this.updateStateFromJWT(tekst);
                  sessionStorage.setItem("authToken",tekst)
                  this.setState({loggedIn:true});
              }else{
                  this.setState({loggedIn:false});
                  localStorage.removeItem("refreshToken")
              }
      }else{
          this.setState({loggedIn:false})
      }
  };


  changeState=(functie:(oldState:IState)=>Partial<IState>)=>{
      this.setState<never>(oldState=> {return functie(oldState)} )
  };

  componentDidUpdate=async (prevProps: Readonly<{}>, prevState: Readonly<IState>, snapshot?: any) =>{
      if (prevState.exp!==this.state.exp){
          if(this.state.logoutTimeout!==null){
              clearTimeout(this.state.logoutTimeout)
          }
          if(this.state.exp!==0){
              var timeOut=window.setTimeout(()=>{
                  sessionStorage.removeItem("authToken");
                  this.updateAuth()
              },this.state.exp*1000-Date.now());
              this.setState({logoutTimeout:timeOut})
          }
      }
      if(!prevState.loggedIn && this.state.loggedIn){
          this.updateUserData()
      }
  };

  logout=()=>{
      fetch(this.state.serverLink+"/auth/logout",{method:"Delete",
      headers:{
          refreshToken:localStorage.getItem("refreshToken")
      }});
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("authToken");
      clearTimeout(this.state.logoutTimeout);
      this.setState({loggedIn:false,logoutTimeout:null})
  };



    render(){
    return (
        <div>
            <BrowserRouter>
                <Menu avatar={this.state.avatar} naam={this.state.naam} isWerkgever={this.state.isWerkgever} logoutFunction={this.logout} loggedIn={this.state.loggedIn}/>
                {
                    this.state.loading?
                    <div className="center">
                        <img src={loadingIcon} width={300} style={{margin:"auto"}}/>
                    </div>:
                    <div>

                        <Switch>
                            <Route path={"/emailverificatie/:email"} render={(props:{match:{params:{email:string}}}) => <EmailVerificatie apiLink={this.state.apiLink} email={props.match.params.email}/>}/>
                            {
                                this.state.loggedIn ?
                                    <Switch>
                                        <Route path="/MyAccount" render={() => <MyAccount apiLink={this.state.apiLink} serverLink={this.state.serverLink}/>}/>
                                        <Route path="/" exact render={() => <Home apiLink={this.state.apiLink} serverLink={this.state.serverLink} isWerkgever={this.state.isWerkgever}/>}/>
                                        <Route path="/ZiekMeld/:roosterItemId/:notifId/:messageId"  render={(props:{match:{params:{roosterItemId:number, notifId:number, messageId:number}}}) => <ZiekMeld apiLink={this.state.apiLink} serverLink = {this.state.serverLink} roosterItemId={props.match.params.roosterItemId} notifId={props.match.params.notifId} messageId={props.match.params.messageId} currentUser={this.state.id}/>}/>
                                        <Route path="/Rooster" render={() => <Rooster apiLink={this.state.apiLink} isWerkgever={this.state.isWerkgever}/>}/>
                                        <Route path="/ZiekmeldFeedback" render={() => <ZiekmeldFeedback/>}/>
                                        <Route path="/OvernameFeedback/:messageId/:approve" render={(props:{match:{params:{messageId:number, approve:string}}}) => <OvernameFeedback messageId={props.match.params.messageId} approve={props.match.params.approve}/>}/>
                                        {
                                            this.state.isWerkgever?
                                                <Switch>

                                                    <Route path='/WerknemersOverzicht' render={() => <WerknemersOverzicht apiLink={this.state.apiLink}/>}/>

                                                </Switch>:
                                                <Switch>
                                                </Switch>
                                        }
                                    </Switch>
                                    :
                                    <Switch>
                                        <Route path="/registratie" render={() => <Registratie apiLink={this.state.apiLink}/>}/>
                                        <Route path="/RegistratieFeedback" render={() => <RegistratieFeedback apiLink={this.state.apiLink}/>}/>
                                        <Route path="/" render={() => <Login updateAuth={this.updateAuth} apiLink={this.state.apiLink} changeHigherState={this.changeState} serverLink={this.state.serverLink}/>}/>
                                    </Switch>
                            }
                        </Switch>
                    </div>
                }

              </BrowserRouter>
        </div>
    );
  }
}
export default App;
