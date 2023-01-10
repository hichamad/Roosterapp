import React from "react";
import {NavLink} from "react-router-dom";

interface IProps {
    tekst:string
    path:string
    url?:string
}

function MenuItem(props:IProps) {
    return (<li><NavLink activeClassName={"active"} exact={true} className="menuItem" to={props.path}>{props.tekst}</NavLink></li>)
}
export default MenuItem