import React, { useState } from "react";
import RoupaEletro from "../../assets/images/RoupaEletro.png";
import ManRunning from "../../assets/images/man-3d-running.png";

import { styles } from "../../constants/modalStyle";

function PerformanceComponent(){
    const [openModal, setOpenModal] = useState(false);
    
    return(
        <div >
            <div className="dashboard-div-right" style={{marginBottom: '1vw'}}>
                <p>ROUPA ELETROESTIMULAÇÃO</p>
                <img src={RoupaEletro} alt="Roupa Eletro" width="60%" height="300px" style={{display: "block", margin: "0 auto"}}/>
            </div>
            <div className="dashboard-div-right" onClick={() => setOpenModal(true)} style={{cursor: 'pointer'}}>
                <p>RECONSTRUÇÃO 3D</p>
                <img src={ManRunning} alt=""  width="80%" height="80%"/>
            </div>
            
        </div>
    )
};

export default PerformanceComponent;