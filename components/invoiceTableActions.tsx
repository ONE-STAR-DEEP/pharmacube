"use client";

import PaymentPopup from "./account/PaymentPopup";
import ItemUpdatePopup from "./checker/ItemUpdatePopup";
import DeliveryCheckPopup from "./delivery/DeliveryCheckPopup";
import DiscrepancyCheckPopup from "./reviewer/DiscrepancyCheckPopup";
import { useRole } from "./UserContext";

const InvoiceTableActions = ({ VNo, Vtyp }: { VNo: string; Vtyp: string }) => {

    const { role } = useRole();

    if (role === "warehouse") {
        return (
            <ItemUpdatePopup VNo={VNo} Vtyp={Vtyp} />
        )
    } else if (role === "checker") {
        return (
            <ItemUpdatePopup VNo={VNo} Vtyp={Vtyp} />
        )
    } else if (role === "reviewer" || role === "fullAccess") {
        return (
            <DiscrepancyCheckPopup VNo={VNo} Vtyp={Vtyp} />
        )
    }
    else if (role === "delivery") {
        return (
            <DeliveryCheckPopup VNo={VNo} Vtyp={Vtyp} />
        )
    }
    else if (role === "account") {
        return (
            <PaymentPopup VNo={VNo} Vtyp={Vtyp} />
        )
    }
}

export default InvoiceTableActions