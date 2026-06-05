import { fetchEInvoice, fetchInvoiceByVNo, fetchInvoiceItems } from "@/lib/actions/invoice"
import { BackButton } from "@/components/BackButton"
import InvoiceLayout from "@/components/InvoiceLayout"
import InvoiceControls from "@/components/InvoiceControls"

type Props = {
    params: Promise<{
        VNo: string
    }>
}

export default async function InvoicePage({ params }: Props) {
    const { VNo } = await params

    const [Vtyp, Vno] = VNo.split("-");

    const billData = await fetchInvoiceByVNo(Vno, Vtyp);
    const billItems = await fetchInvoiceItems(Vno, Vtyp);
    const einvoiceData = await fetchEInvoice(Vtyp, Vno)

    if (!(billData.data && billItems.data)) {
        return;
    }

    return (
        <div className="w-full">
            <InvoiceLayout billData={billData.data} billItems={billItems.data} einvoice={einvoiceData.data}/>

            <div className="flex w-full justify-center items-center mb-4 gap-4">
                <InvoiceControls VNo={Number(Vno)} Vtyp={Vtyp}/>
            </div>
        </div>
    )
}