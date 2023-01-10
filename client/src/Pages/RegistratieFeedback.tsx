import React from 'react';

interface IProps {
    apiLink: string
}

class RegistratieFeedback extends React.Component<IProps> {

    render() {
        return(
            <div id="reg">
                <table>
                    <tbody>
                    <tr>
                        <td align={"center"}>Uw registratie is succesvol, u kunt deze pagina verlaten.</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default RegistratieFeedback