import React    from "react"
import { Link } from "react-router-dom";

interface IProps{
    messageId:number;
    approve:string
}

class OvernameFeedback
    extends React.Component<IProps> {
    render() {
        return (
            <div id="reg">
                <table>
                    <tbody>
                    <tr>
                        <td align={ "center" }>{(this.props.messageId == 0) ?
                            (this.props.approve == "true") ? "Je hebt de overname goedgekeurd." : "Je hebt de overname afgekeurd."
                            :
                            (this.props.messageId == 1) ?
                                (this.props.approve == "true") ? "Je hebt een overnameverzoek gestuurd naar de werkgevers." : "Je hebt het verzoek afgewezen."
                                :
                                (this.props.approve == "true") ? "Je hebt je eigen verzoek verwijderd" : "Verzoek is niet geannuleerd."
                        }<br/><Link to="/">Klik hier om door te gaan.</Link></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default OvernameFeedback