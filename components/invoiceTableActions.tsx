"use client";

import ItemUpdatePopup from "./checker/ItemUpdatePopup";
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
}

export default InvoiceTableActions