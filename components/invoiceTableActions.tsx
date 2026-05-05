"use client";

import ItemUpdatePopup from "./checker/ItemUpdatePopup";
import DeliveryCheckPopup from "./delivery/DeliveryCheckPopup";
import DiscrepancyCheckPopup from "./reviewer/DiscrepancyCheckPopup";
import { useRole } from "./UserContext";

const InvoiceTableActions = ({ VNo, Vtyp }: { VNo: string; Vtyp: string }) => {

    const { role, isPlusUser } = useRole();
    console.log(role, isPlusUser)

    if (role === "warehouse") {
        return (
        <ItemUpdatePopup VNo={VNo} Vtyp={Vtyp} />
    )
    } else if (role === "checker") {
        return (
            <ItemUpdatePopup VNo={VNo} Vtyp={Vtyp} />
        )
    } else if (role === "reviewer") {
        return (
            <DiscrepancyCheckPopup VNo={VNo} Vtyp={Vtyp} />
        )
    }
    else if (role === "delivery") {
        return (
            <DeliveryCheckPopup VNo={VNo} Vtyp={Vtyp}/>
        )
    }
}

export default InvoiceTableActions