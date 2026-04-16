"use client";

import ItemUpdatePopup from "./checker/ItemUpdatePopup";
import DeliveryCheckPopup from "./delivery/DeliveryCheckPopup";
import DiscrepancyCheckPopup from "./reviewer/DiscrepancyCheckPopup";
import { useRole } from "./UserContext";

const InvoiceTableActions = ({ VNo }: { VNo: string }) => {

    const type = useRole();

    if (type === "warehouse") {
        return (<>W</>)
    } else if (type === "checker") {
        return (
            <ItemUpdatePopup VNo={VNo} />
        )
    } else if (type === "reviewer") {
        return (
            <DiscrepancyCheckPopup VNo={VNo} />
        )
    }
    else if (type === "delivery") {
        return (
            <DeliveryCheckPopup VNo={VNo} />
        )
    }
}

export default InvoiceTableActions