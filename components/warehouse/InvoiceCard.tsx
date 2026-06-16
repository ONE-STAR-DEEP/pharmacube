"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { InvoiceData } from "@/utils/types/DataTypes"
import { Button } from "../ui/button";
import { approveSelectedInvoice, markAsUrgent } from "@/lib/actions/invoice";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

const InvoiceCard = ({ data }: { data: InvoiceData[] }) => {

  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([])

  const handleClick = async (id: number) => {
    try {
      const res = await markAsUrgent(id)
      if (!res.success) {
        alert("Failed to update. Try again.")
        return
      }
      router.refresh()
    } catch (error) {
      console.log(error)
    }
  }

  const handleApprove = async () => {
    try {
      const res = await approveSelectedInvoice(selected)
      if (!res.success) {
        alert("Failed to update. Try again.")
        return
      }
      setSelected([])
      router.refresh()
    } catch (error) {
      console.log(error)
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
            <div className="flex">
              <input
                type="checkbox"
                className="ml-2"
                checked={selected.includes(invoice.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelected((prev) => [...prev, invoice.id]);
                  } else {
                    setSelected((prev) => prev.filter((id) => id !== invoice.id));
                  }
                }}
              />
              <AccordionTrigger className="flex w-[78vw]">
                <span className={`font-bold ${Boolean(invoice.urgent) && "text-red-600"}`}>{invoice.GSTVno}</span>
                <span className="font-light">{new Date(invoice.Vdt).toLocaleDateString("en-GB")} - {invoice.mTime}</span>
              </AccordionTrigger>
            </div>

            <AccordionContent>
              <p>{invoice.partyName}</p>

              <div className="grid grid-cols-[40%_60%]">
                <span>No. of Items</span>
                <span>: {invoice.NoOfItem}</span>

                <span>Status</span>
                <span className={`capitalize font-medium ${colorMap[Number(invoice.status) as keyof typeof colorMap]}`}>: {STATUS_LABEL[Number(invoice.status)]}</span>

                <span>Amount</span>
                <span>: {invoice["InvAmt"]}</span>
              </div>

              <div className="flex items-center justify-end gap-1">
                <Button className="m-0 px-2" onClick={() => {
                  window.open(`/invoice/warehouse/${invoice.Vtyp}-${invoice.Vno}`, "_blank", "noopener,noreferrer")
                }}>
                  View
                </Button>
                {
                  (!Boolean(invoice.urgent) && invoice.status < 6) &&
                  <Button onClick={() => handleClick(invoice.id)}>
                    Urgent
                  </Button>
                }
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion >
      ))}

      {selected.length > 0
        &&
        <button
          onClick={() => handleApprove()}
          className="
                fixed
                bottom-6
                left-1/2
                -translate-x-1/2
                z-50
                rounded-full
                bg-primary
                px-6
                py-3
                text-white
                shadow-lg
                hover:bg-primary/70
                transition-colors
                "
        >
          Process Selected
        </button>
      }
    </>
  );
};

export default InvoiceCard;