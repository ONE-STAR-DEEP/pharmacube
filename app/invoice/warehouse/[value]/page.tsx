
import { approveInvoice, fetchInvoiceByVNo, fetchInvoiceItems } from "@/lib/actions/invoice"
import { BackButton } from "@/components/BackButton"
import InvoiceLayout from "@/components/InvoiceLayout"

type Props = {
    params: Promise<{
        value : string
    }>
}

export default async function InvoicePage({ params }: Props) {
    const { value } = await params

    console.log(value)

    const [Vtyp, VNo] = value.split('-');

    const billData = await fetchInvoiceByVNo(VNo, Vtyp);
    const billItems = await fetchInvoiceItems(VNo, Vtyp);
    await approveInvoice(VNo, Vtyp)

    if (!(billData.data && billItems.data)) {
        return;
    }

    return (
        <div className="w-full">
            <InvoiceLayout billData={billData.data} billItems={billItems.data} />

            <div className="flex w-full justify-center items-center mb-4 gap-4">
                <BackButton />
            </div>
        </div>
    )
}