"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { InvoiceData } from "@/utils/types/DataTypes"
import { Button } from "../ui/button";
import { markAsUrgent } from "@/lib/actions/invoice";
import { useRouter } from "next/navigation";
import ItemUpdatePopup from "../checker/ItemUpdatePopup";

const InvoiceCard = ({ data }: { data: InvoiceData[] }) => {

  const router = useRouter();

  const handleClick = async (id: number) => {

    try {
      const res = await markAsUrgent(id)
      if (!res.success) {
        alert("Failed to update. Try again.")
        return
      }
      router.refresh()
    } catch (error) {

    }
  }

  return (
    <>
      {data.map((invoice) => (
        <Accordion
          key={invoice.id}
          type="single"
          collapsible
          className={`${Boolean(invoice.urgent) && "bg-red-100"}`}
        >
          <AccordionItem value={`item-${invoice.id}`}>
            <AccordionTrigger>
              <span className={`font-bold ${Boolean(invoice.urgent) && "text-red-600"}`}>{invoice.GSTVno}</span><span className="font-light">{new Date(invoice.Vdt).toLocaleDateString("en-GB")} - {invoice.mTime}</span>
            </AccordionTrigger>

            <AccordionContent>
              <p>{invoice.partyName}</p>

              <div className="grid grid-cols-[40%_60%]">
                <span>No. of Items</span>
                <span>: {invoice.NoOfItem}</span>

                <span>Amount</span>
                <span>: {invoice["InvAmt"]}</span>
              </div>

              <div className="flex items-center justify-end gap-1 mt-2">
                <Button className="m-0 px-2" onClick={() => {
                  window.open(`/invoice/${invoice.Vtyp}-${invoice.Vno}`, "_blank", "noopener,noreferrer")
                }}>
                  View
                </Button>
                <ItemUpdatePopup VNo={invoice.Vno} Vtyp={invoice.Vtyp} />
                {
                  (!Boolean(invoice.urgent) && invoice.status < 6) && <Button onClick={() => handleClick(invoice.id)}>
                    Urgent
                  </Button>
                }
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion >
      ))}
    </>
  );
};

export default InvoiceCard;