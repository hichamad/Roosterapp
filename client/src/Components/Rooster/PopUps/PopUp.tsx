import React from "react";





class PopUp extends React.Component{

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <div className="popUp">
                {this.props.children}
            </div>
        )
    }
}

export default PopUp