import React from 'react'

interface IProps {
    icon:string
    text:string
    imgClass?:string
    onClick?:(event:React.MouseEvent)=>void
    className?:string
}

function OptionWithIcon(props:IProps) {
    return(
        <div onClick={props.onClick} className={"row clickAble centerContent "+props.className}>
            <img width="30px" className={props.imgClass} src={require("../icons/"+props.icon)}/>
            <p className="noVertMargin">{props.text}</p>
        </div>
    )
}
export default OptionWithIcon