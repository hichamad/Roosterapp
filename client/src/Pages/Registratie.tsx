import React, {MouseEventHandler} from 'react';
import {Link} from "react-router-dom";
import {Redirect} from 'react-router-dom';
import ProfielFotoBijsnijder from "../Components/ProfielFotoBijsnijder";

interface IState {
    // Globale variabelen.
    firstName: string,
    lastName: string,
    email: string,
    pass: string,
    secondPass: string,
    secondPassSame: boolean,
    phone: string,
    birth: string,
    foto: string,
    isWerkgever: boolean,
    roosterName: string,
    koppelCodeWerknemer: string,
    koppelCodeWerkgever: string,
    // Feedback
    registratieSucces: boolean,
    addgebruikerSuccess: boolean,
    addroosterSuccess: boolean,
    checkemailSuccess: boolean,
    checkKoppelCodeSuccess: boolean,
    koppelgebruikerSuccess: boolean,
    // Beschrijf de toegestane symbolen voor de inputvelden.
    letters: RegExp,
    numbers: RegExp,
    passwords: RegExp,
    // Sla op of inputvelden al zijn aangeraakt door de gebruiker.
    touched: {
        firstName: boolean,
        lastName: boolean,
        email: boolean,
        pass: boolean,
        secondPass: boolean,
        phone: boolean,
        birth: boolean,
        roosterName: boolean,
        koppelCodeWerknemer: boolean
    },
    fotoFile: File,
    blackCircle: boolean,
    getImage: () => Promise <Blob>
}

interface IProps {
    apiLink:string
}

class Registratie extends React.Component<IProps,IState>{
    private lijst:(keyof IState)[];

    constructor(props:IProps){
        super(props);
        this.state = {
            // Globale variabelen.
            firstName: '',
            lastName: '',
            email: '',
            pass: '',
            secondPass: '',
            secondPassSame: false,
            phone: '',
            birth: '',
            foto: '',
            isWerkgever: false,
            roosterName: '',
            koppelCodeWerknemer: '',
            koppelCodeWerkgever: '',
            // Feedback
            registratieSucces: false,
            addgebruikerSuccess: false,
            addroosterSuccess: false,
            checkemailSuccess: false,
            checkKoppelCodeSuccess: false,
            koppelgebruikerSuccess: false,
            // Beschrijf de toegestane symbolen voor de inputvelden. Geen spaties voor en na inputs, wel mogen in namen spaties zitten.
            letters: /^[A-Za-z]?[A-Z\sa-z]*[A-Za-z]$/,
            numbers: /^[^\s][0-9]+[^\s]$/,
            passwords: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){6,}$/,
            // Sla op of inputvelden al zijn aangeraakt door de gebruiker.
            touched: {
                firstName: false,
                lastName: false,
                email: false,
                pass: false,
                secondPass: false,
                phone: false,
                birth: false,
                roosterName: false,
                koppelCodeWerknemer: false
            },
            fotoFile: null,
            blackCircle: true,
            getImage: null
        };
        // Lijst om uit te lezen voor het POST request.
        this.lijst = ["firstName", "lastName", "email", "pass", "phone", "birth", "isWerkgever"];
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.generateKoppelCode();
    };

    generateKoppelCode = async () => {
        // Genereer een willekeurige serie van nummers.
        let value: string = (Math.floor(Math.random() * 100000 ) + 1).toString();

        // Controlleer of de gegenereerde koppelcode al in de database staat.
        let koppelcode: any = await fetch(this.props.apiLink + "/account/checkkoppelcode", {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({value})
        }).then(res => res.json());

        // Verwerk de feedback vanuit de server.
        if (koppelcode.koppelCodeCheck == 0) {
            this.setState({koppelCodeWerkgever: value});
        } else if (koppelcode.koppelCodeCheck == 1) {
            this.generateKoppelCode();
        }
    };

    // Controlleer of de waarden in een veld wel verstuurd kunnen worden.
    canBeSubmitted() {
        const errors = this.validate(this.state.firstName, this.state.lastName, this.state.email, this.state.pass, this.state.phone, this.state.birth, this.state.roosterName, this.state.koppelCodeWerknemer, this.state.secondPass);
        const isDisabled = Object.values(errors).some(value => value);
        return !isDisabled;
    }

    // Ververs de waarden wanneer deze veranderd worden door de gebruiker.
    handleInputChange = async (event:React.ChangeEvent<HTMLInputElement>) => {

        // Laat de waarde de waarde zijn van het actieve veld. Als het input-type een checkbox is is de waarde of deze aangevinkt is of niet.
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if (target.type === "file"){ this.setState<never> ({[name+"File"]: target.files[0]}) }

        await this.setState<never> ({[name]: value});

        // Voer een check uit of het ingevoerde email al in de database staat of niet wanneer het "email" inputveld wordt gewijzigd.
        if (target.name === "email") { this.checkEmail(); }
        // Voer een check uit of de ingevoerde koppelcode al in de database staat of niet wanneer het "koppelCodeWerknemer" inputveld wordt gewijzigd.
        if (target.name === "koppelCodeWerknemer") { this.checkKoppelCode(); }

        // Check of de waarden van het eerste en tweede wachtwoord gelijk zijn. Verander de state naar aanleiding van de uitkomst.
        if(target.name === "pass" || target.name === "secondPass") {
            if (this.state.secondPass == this.state.pass) { await this.setState({secondPassSame: true});
            } else { await this.setState({secondPassSame: false}) }
        }
    };

    // Verander de waarde van touched voor een inputveld naar true.
    handleBlur = (field:string) => (event:React.FocusEvent) => {
        this.setState({
            touched: {...this.state.touched, [field]: true},
        });
    };

    // Check de database voor het bestaan van een email.
    checkEmail = async () => {
        let email: any = await fetch(this.props.apiLink + "/account/checkemail", {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({email: this.state.email})
        }).then(res => res.json());

        this.setState({checkemailSuccess: email.emailCheck});
    };

    // Check de database voor het bestaan van een koppelcode.
    checkKoppelCode = async () => {
        let koppelcode: any = await fetch(this.props.apiLink + "/account/checkkoppelcodewerknemer", {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({koppelCodeWerknemer: this.state.koppelCodeWerknemer})
        }).then(res => res.json());

        this.setState({checkKoppelCodeSuccess: koppelcode.koppelCodeCheck});
    };

    validate(firstName:string, lastName:string, email:string, pass:string, phone:string, birth:string, roosterName:string, koppelCodeWerknemer:string, secondPass:string) {
        return {
            // Als een waarde hier true is betekent dat dat het veld niet valide is.
            firstName: firstName.length === 0 || firstName.length >= 30 || !firstName.match(this.state.letters),
            lastName: lastName.length === 0 || lastName.length >= 30 || !lastName.match(this.state.letters),
            email: email.length === 0 || email.length >= 30 || this.state.checkemailSuccess,
            pass: pass.length === 0 || !pass.match(this.state.passwords),
            secondPass: secondPass.length === 0 || !this.state.secondPassSame,
            phone: phone.length === 0 || phone.length >= 20 || !phone.match(this.state.numbers),
            birth: birth.length === 0,
            roosterName: this.state.isWerkgever && roosterName.length === 0,
            koppelCodeWerknemer: !this.state.isWerkgever && koppelCodeWerknemer.length === 0 || !this.state.isWerkgever && !this.state.checkKoppelCodeSuccess
        };
    }

    // Converteer de waarden uit de state naar een JSON string om die in een POST request te plaatsen en te versturen.
    handleSubmit = async (event:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();

        // Laat de data niet verstuurd worden wanneer de input validatie niet succesvol is.
        if (!this.canBeSubmitted()) {return;}

        // Stel de informatie samen voor het toevoegen van de gebruiker.
        await this.setState({blackCircle:false});
        let image = null;
        if (this.state.foto != "") {image = await this.state.getImage();}

        let formData = new FormData();
        formData.append("profielFoto",image);
        this.lijst.forEach( value => {
            let val = this.state[value];
            formData.append(value, val.toString())
        });

        // Voeg de gebruiker toe aan de database.
        let addgebruiker: any = await fetch(this.props.apiLink+"/account/addgebruiker",{
            method:'POST',
            body:formData
        }).then(res => res.json());
        // Verwerk de feedback vanuit de server.
        this.setState({addgebruikerSuccess: addgebruiker.addgebruikerSuccess});

        // Maak een nieuw rooster aan in de database.
        if (this.state.isWerkgever) {
            let addrooster: any = await fetch(this.props.apiLink + "/account/addrooster", {
                headers: {'Content-Type': 'application/json'},
                method: 'POST',
                body: JSON.stringify({roosterName: this.state.roosterName, koppelCodeWerkgever: this.state.koppelCodeWerkgever, email: this.state.email})
            }).then(res => res.json());
            // Verwerk de feedback vanuit de server.
            this.setState({addroosterSuccess: addrooster.addroosterSuccess});
        }

        // Koppel een gebruiker aan het rooster dat bij zijn koppelcode hoort.
        if (!this.state.isWerkgever) {
            let koppelgebruiker: any = await fetch(this.props.apiLink + "/account/koppelgebruiker", {
                headers: {'Content-Type': 'application/json'},
                method: 'PUT',
                body: JSON.stringify({email: this.state.email, koppelCodeWerknemer: this.state.koppelCodeWerknemer})
            }).then(res => res.json());
            // Verwerk de feedback vanuit de server.
            this.setState({koppelgebruikerSuccess: koppelgebruiker.koppelgebruikerSuccess})
        }

        // Geef door dat de registratie succesvol is wanneer...
        if (this.state.isWerkgever && this.state.addgebruikerSuccess && this.state.addroosterSuccess) {
            this.setState({registratieSucces: true});
        } else if (!this.state.isWerkgever && this.state.addgebruikerSuccess && this.state.koppelgebruikerSuccess) {
            this.setState({registratieSucces: true});
        }
    };

    // Verzamel de inputs van de gebruiker om die in de state op te slaan.
    render() {
        type fields = {birth: boolean, email: boolean, firstName: boolean, lastName: boolean, pass: boolean, phone: boolean, roosterName: boolean, koppelCodeWerknemer: boolean, secondPass: boolean}
        const errors:fields = this.validate(this.state.firstName, this.state.lastName, this.state.email, this.state.pass, this.state.phone, this.state.birth, this.state.roosterName, this.state.koppelCodeWerknemer, this.state.secondPass);
        const isDisabled = Object.values(errors).some(value => value);

        // Valideer of een fout getoond zou moeten worden.
        const shouldMarkError = (field: keyof typeof errors) => {
            const hasError = errors[field];
            const shouldShow = this.state.touched[field];
            return hasError ? shouldShow : false;
        };

        // Verzamel de inputs van de gebruiker om die in de state op te slaan.
        // Als er een foto is geselecteerd wordt hieruit een afbeelding aangemaakt.
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
                            <td><ProfielFotoBijsnijder size={350} blackCircle={this.state.blackCircle} setImageGetFunction={(functie)=>{this.setState({getImage:functie})}} image={this.state.fotoFile}/></td>
                        </tr>
                        <tr>
                            <label>Upload Profielfoto</label>
                            <td><input type="file" accept={"image/*"}  onChange={this.handleInputChange} name="foto"/></td>
                        </tr>

                        <tr>
                            <label>Voornaam</label>
                            <td><input className={shouldMarkError('firstName') ? "error" : ""}
                                       onBlur={this.handleBlur('firstName')}
                                       type='text' name="firstName" value={this.state.firstName} placeholder="Voornaam" onChange={this.handleInputChange}/></td>

                        </tr>
                        {   // Dit is een errormessage. Het checkt of het toepasbare veld in de 'errors' array staat, en als daarnaast het veld ook nog niet is aangeraakt wordt een bericht getoond onder het inputveld.
                            errors.firstName && this.state.touched.firstName ? <span className={"validationMessage"}>Vul een naam in met alleen letters.</span> : ''}

                        <tr>
                            <label>Achternaam</label>
                            <td><input className={shouldMarkError('lastName') ? "error" : ""}
                                       onBlur={this.handleBlur('lastName')}
                                       type='text' name="lastName" value={this.state.lastName} placeholder="Achternaam" onChange={this.handleInputChange}/></td>
                        </tr>
                        {errors.lastName && this.state.touched.lastName ? <span className={"validationMessage"}>Vul een naam in met alleen letters.</span> : ''}

                        <tr>
                            <label>Email</label>
                            <td><input className={shouldMarkError('email') ? "error" : ""}
                                       onBlur={this.handleBlur('email')}
                                       type='email' name="email" value={this.state.email} placeholder="Email" onChange={this.handleInputChange}/></td>
                        </tr>
                        {errors.email && this.state.touched.email ? <span className={"validationMessage"}>Vul een uniek email in.</span> : ''}

                        <tr>
                            <label>Telefoonnummer</label>
                            <td><input className={shouldMarkError('phone') ? "error" : ""}
                                       onBlur={this.handleBlur('phone')}
                                       type='text' name="phone" value={this.state.phone} placeholder="Telefoonnummer" onChange={this.handleInputChange}/></td>
                        </tr>
                        {errors.phone && this.state.touched.phone ? <span className={"validationMessage"}>Vul een telefoonnummer in dat bestaat uit cijfers.</span> : ''}

                        <tr>
                            <label>Geboortedatum</label>
                            <td><input className={shouldMarkError('birth') ? "error" : ""}
                                       onBlur={this.handleBlur('birth')}
                                       type='date' name="birth" value={this.state.birth} placeholder="Geboortedatum" onChange={this.handleInputChange}/></td>
                        </tr>
                        {errors.birth && this.state.touched.birth ? <span className={"validationMessage"}>Vul een geboortedatum in.</span> : ''}

                        <tr>
                            <label>Wachtwoord</label>
                            <td><input className={shouldMarkError('pass') ? "error" : ""}
                                       onBlur={this.handleBlur('pass')}
                                       type='password' name="pass" value={this.state.pass} placeholder="Wachtwoord" onChange={this.handleInputChange}/></td>
                        </tr>
                        {errors.pass && this.state.touched.pass ? <span className={"validationMessage"}>Vul een wachtwoord in langer dan 6 symbolen met minimaal 1 kleine letter, 1 hoofdletter en een symbool.</span> : ''}

                        <tr>
                            <label>Bevestiging wachtwoord</label>
                            <td><input className={shouldMarkError('secondPass') ? "error" : ""}
                                       onBlur={this.handleBlur('secondPass')}
                                       type='password' name="secondPass" value={this.state.secondPass} placeholder="Wachtwoord" onChange={this.handleInputChange}/></td>
                        </tr>
                        {errors.secondPass && this.state.touched.secondPass ? <span className={"validationMessage"}>De ingevulde wachtwoorden komen niet overeen.</span> : ''}

                        <tr>
                            <label>Account voor werkgever</label>
                            <td><input type='checkbox' name="isWerkgever" checked={this.state.isWerkgever} placeholder="false" onChange={this.handleInputChange} /></td>
                        </tr>

                        { this.state.isWerkgever ?
                            <tr>
                                <label>Roosternaam</label>
                                <td><input className={shouldMarkError('roosterName') ? "error" : ""}
                                           onBlur={this.handleBlur('roosterName')}
                                           type='text' name="roosterName" value={this.state.roosterName} placeholder="Roosternaam" onChange={this.handleInputChange}/></td>
                            </tr> : ''
                        }
                        {errors.roosterName && this.state.touched.roosterName ? <span className={"validationMessage"}>Vul een naam in voor uw rooster.</span> : ''}

                        { this.state.isWerkgever ?
                            <tr>
                                <label>Koppelcode</label>
                                <td><input name="koppelCodeWerkgever" value={this.state.koppelCodeWerkgever}/></td>
                            </tr>
                            :
                            <tr>
                                <label>Koppelcode</label>
                                <td><input className={shouldMarkError('koppelCodeWerknemer') ? "error" : ""}
                                           onBlur={this.handleBlur('koppelCodeWerknemer')}
                                           type='text' name="koppelCodeWerknemer" value={this.state.koppelCodeWerknemer} placeholder="Koppelcode" onChange={this.handleInputChange}/></td>
                            </tr>
                        }
                        {errors.koppelCodeWerknemer && this.state.touched.koppelCodeWerknemer ? <span className={"validationMessage"}>Vul een bestaande koppelcode in.</span> : ''}

                        <button disabled={isDisabled} onClick={this.handleSubmit}>Registreer</button>
                        {
                            this.state.registratieSucces && <Redirect to={{pathname: '/RegistratieFeedback'}}/>
                        }

                        </tbody>
                    </table>
                </form>
            </div>
        )
    }
}

export default Registratie