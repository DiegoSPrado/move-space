import React from "react";
import AppHeader from "../components/dashbordComponents/AppHeader";

function CheckupBiotriagem() {
    return(
        <div className="checkup-biotriagem-container">
            <AppHeader onClose={alert}/>
            <h1>Checkup Fisiológico Biotriagem</h1>
            <p>Em breve, esta funcionalidade estará disponível.</p>
            <p>Fique atento às atualizações!</p>
        </div>
    )
}

export default CheckupBiotriagem;
