import { fetchDiscrepancyeByVNo, fetchDiscrepancyItems, fetchInvoiceByVNo, fetchInvoiceItems } from "@/lib/actions/invoice"
import { BackButton } from "@/components/BackButton"
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

    const billData = await fetchDiscrepancyeByVNo(Vno, Vtyp);
    const billItems = await fetchDiscrepancyItems(Vno, Vtyp);

    if (!(billData.data && billItems.data)) {
        return;
    }

    return (
        <div className="w-full">
            <InvoiceLayout billData={billData.data} billItems={billItems.data} />

            <div className="flex w-full justify-center items-center mb-4 gap-4 print:hidden">
                <BackButton />
                <PrintButton />
            </div>
        </div>
    )
}