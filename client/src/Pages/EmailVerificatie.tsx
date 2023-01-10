import React from 'react';

interface IProps {
    apiLink:string
    email:string
}

class EmailVerificatie extends React.Component<IProps> {

    verify() {
        fetch(this.props.apiLink + "/account/activeergebruiker", {
            method: 'PUT',
            body: JSON.stringify({
                email:this.props.email
            }),
            headers: { "Content-Type": "application/json; charset=utf-8" }
        })
    }

    componentDidMount() {
        this.verify();
    }

    render() {
        return(
            <div id="reg">
                <table>
                    <tbody>
                        <tr>
                            <td align={"center"}>Uw verificatie is succesvol, u kunt deze pagina verlaten.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
export default EmailVerificatie