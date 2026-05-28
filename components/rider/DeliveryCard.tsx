"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { InvoiceData } from "@/utils/types/DataTypes"
import { Button } from "../ui/button";
import DeliveryCheckPopup from "../delivery/DeliveryCheckPopup";

const DeliveryCard = ({ data }: { data: InvoiceData[] }) => {
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

                <span>Discrepancy</span>
                <span>: {Boolean(invoice.discrepancy) ? "Yes" : "No"}</span>

                <span>Amount</span>
                <span>: {invoice["InvAmt"]}</span>

              </div>

              <div className="flex gap-1 items-center justify-end">
                <Button
                  className="m-0 px-2"
                  onClick={() => {
                    window.open(`/invoice/${invoice.Vtyp}-${invoice.Vno}`, "_blank", "noopener,noreferrer");
                  }}
                >
                  Invoice
                </Button>
                <DeliveryCheckPopup VNo={invoice.Vno} Vtyp={invoice.Vtyp} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
};

export default DeliveryCard;