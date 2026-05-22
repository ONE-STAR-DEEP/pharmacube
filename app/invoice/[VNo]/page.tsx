import { fetchEInvoice, fetchInvoiceByVNo, fetchInvoiceItems } from "@/lib/actions/invoice"
import { PrintButton } from "@/components/PrintButton"
import InvoiceLayout from "@/components/InvoiceLayout"

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

            <div className="flex w-full justify-center items-center mt-4 print:hidden">
                <PrintButton />
            </div>
        </div>
    )
}