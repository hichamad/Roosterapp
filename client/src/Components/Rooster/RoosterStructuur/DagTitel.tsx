import React from 'react'

interface IProps {
    datum:Date
}


class DagTitel extends React.Component<IProps>{

    render() {

        return(
        <div>
            <h1 className="centerText">{this.props.datum.toLocaleDateString("nl-NL",{weekday:"long"}).capitalFirst()}</h1>
            <p className="centerText">{this.props.datum.toLocaleDateString("nl-NL",{day:"2-digit"})+"-"+this.props.datum.toLocaleDateString("nl-NL",{month:"long"}).capitalFirst()}</p>
            <div>
            </div>
        </div>
        )
    }
}
export default DagTitel