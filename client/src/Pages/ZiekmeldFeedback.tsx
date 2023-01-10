import React    from "react"
import { Link } from "react-router-dom";

interface IProps{}

class ZiekmeldFeedback
    extends React.Component<IProps> {
    render() {
        return (
            <div id="reg">
                <table>
                    <tbody>
                    <tr>
                        <td align={ "center" }>Je hebt voor deze dienst om vervanging gevraagd.<br/><Link to="/">Klik hier om door te gaan.</Link></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ZiekmeldFeedback