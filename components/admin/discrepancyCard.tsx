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

const Discrepancy_LABEL: Record<number, string> = {
  0: "No",
  1: "Yes",
  2: "Resolved",
};

const colorMap = {
  0: "text-red-600",
  1: "text-blue-600",
  2: "text-green-600",
  3: "text-amber-600",
  4: "text-purple-500",
  5: "text-teal-600",
  6: "text-green-700",
  7: "text-blue-700",
  8: "text-yellow-700",
  9: "text-red-700",
  10: "text-emerald-600",
  11: "text-violet-600",
};

const discColorMap = {
  0: "text-green-600",
  1: "text-red-600",
  2: "text-blue-600",
};

const STATUS_LABEL: Record<number, string> = {
  0: "Pending",
  1: "Sent to Checker",
  2: "Sent to Reviewer",
  3: "Reviewer Approved",
  4: "Accepted by Rider",
  5: "Out for Delivery",
  6: "Delivered",
  7: "Client Delivery Confirmed",
  8: "Delivered with Discrepancy",
  9: "Discrepancy Raised",
  10: "Discrepancy Resolved",
  190: "Partial Payment Received",
  200: "Payment Received",
  210: "Excessive Payment Received"
};

const DiscrepancyCard = ({ data }: { data: InvoiceData[] }) => {

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

                <span>Discrepancy</span>
                <span className={`capitalize font-medium ${discColorMap[Number(invoice.discrepancy) as keyof typeof discColorMap]}`}>: {Discrepancy_LABEL[Number(invoice.discrepancy)]}</span>

                <span>Status</span>
                <span className={`capitalize font-medium ${colorMap[Number(invoice.status) as keyof typeof colorMap]}`}>: {STATUS_LABEL[Number(invoice.status)]}</span>

                <span>Amount</span>
                <span>: {invoice["InvAmt"]}</span>
              </div>

              <div className="flex items-center justify-end">
                <Button className="m-0 px-2" onClick={() => {
                  window.open(`/invoice/${invoice.Vtyp}-${invoice.Vno}/discrepancy`, "_blank", "noopener,noreferrer")
                }}>
                  View
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion >
      ))}
    </>
  );
};

export default DiscrepancyCard;