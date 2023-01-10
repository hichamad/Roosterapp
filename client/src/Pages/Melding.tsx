import React, {MouseEventHandler} from 'react';
import {Link} from "react-router-dom";
import ProfielFotoBijsnijder from "../Components/ProfielFotoBijsnijder";

interface IState {
}

interface IProps {
    apiLink:string
}

class Melding extends React.Component<IProps,IState>{

    // Verzamel de inputs van de gebruiker om die in de state op te slaan.
    render() {
        return(
            <div id="reg">
                <form>
                    <table>
                        <tbody>
                        <tr>
                            <h1>Registratie</h1>
                        </tr>
                        <tr>
                            <label>Preview Profielfoto</label>
                            <td></td>
                        </tr>
                        <tr>
                            <label>Upload Profielfoto</label>
                            <td></td>
                        </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        )
    }
}

export default Melding
