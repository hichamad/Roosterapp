import React from 'react'
import MenuItem from "./MenuItem";
import OptionWithIcon from "../OptionWithIcon";
import {NavLink} from "react-router-dom";


interface IProps {
    loggedIn:boolean
    logoutFunction:()=>void
    isWerkgever:boolean
    naam:string
    avatar:string
}

interface IState {
    isOpen:boolean
}

class Menu extends React.Component <IProps,IState>{

    constructor(props:IProps){
        super(props);
        this.state={
            isOpen:false
        }
    }
    
    render() {

        return(
            <div className="menu">
                <ul>
                    <li><img id='logo' src="https://i.imgur.com/HVmQHos.png" alt="Logo RoosterIT"/></li>
                    <MenuItem tekst={this.props.loggedIn?"Home":"Inloggen"} path={"/"}/>
                {
                    //Als de gebruiker is ingelogd word een ander menu laten zien
                    this.props.loggedIn?
                        <li >
                            {/*<MenuItem tekst={"Mijn Account"} path={"/MyAccount"}/>*/}
                            <MenuItem  path={"/Rooster"} tekst={"Rooster"}/>

                        </li>:
                        <div>
                            <MenuItem tekst={"Registeren"} path={'/Registratie'}/>.
                        </div>

                }
                    {
                        //Afhankelijk of de gebruiker een werkgever is of niet wordt het menu aangepast
                        this.props.isWerkgever&&this.props.loggedIn?
                            <li>
                                <MenuItem tekst={"Werknemeroverzicht"} path={"/werknemersoverzicht"}/>
                            </li>
                            :
                            <li>
                            </li>
                    }
                </ul>
                {
                    //Hier wordt het balkje rechtsboven gemaakt
                    this.props.loggedIn&&
                    <details className="accountMenu chooseMenu" open={this.state.isOpen}>
                        <div>
                            <NavLink to={"./MyAccount"} onClick={event => this.setState({isOpen:true},() => this.setState({isOpen:false}))} className="noDecoration" ><OptionWithIcon icon="person.svg" text="Mijn Account"/></NavLink>
                            <OptionWithIcon onClick={event => this.props.logoutFunction()} icon="lock-24px.svg" text="Uitloggen"/>
                        </div>
                        <summary>
                            <div className="accountInformationMenu negStyle clickAble">
                                <img className="avatar avatarMini" src={this.props.avatar}/>
                                <p className="noMargin">{this.props.naam}</p>
                            </div>
                        </summary>
                    </details>
                }
            </div>
        )
    }
}
export default Menu