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
import Logs from "./Logs";
import { useRole } from "../UserContext";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup } from "../ui/field";
import { useState } from "react";
import { changeStage } from "@/lib/actions/admin";

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

const STAGE_LABEL: Record<number, string> = {
  0: "Warehouse",
  1: "Checking",
  2: "Review",
  3: "Account/Rider",
  6: "Delivery",
}

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
  const { role } = useRole();
  const [openMove, setOpenMove] = useState(false);
  const [stage, setStage] = useState(0)
  const [stageLoading, setStageLoading] = useState(false)

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

  const handleSubmit = async (id: number) => {
    if (stageLoading) return;
    setStageLoading(true)
    try {
      const res = await changeStage(id, stage)
      if (!res.success) {
        alert("Failed to update. Try again.")
        return
      }
      router.refresh()
      setOpenMove(false)
    } catch (error) {
      console.log(error)
    } finally {
      setStageLoading(false)
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

                <span>Payment</span>
                <span>: {Boolean(invoice.payment) ? "Yes" : "No"}</span>

                <span>Amount</span>
                <span>: {invoice["InvAmt"]}</span>
              </div>

              <div className="flex items-center mt-2 justify-end gap-1">
                <Button className="m-0 px-2" onClick={() => {
                  window.open(`/invoice/${invoice.Vtyp}-${invoice.Vno}`, "_blank", "noopener,noreferrer")
                }}>
                  View
                </Button>

                {
                  role === "admin" &&
                  <Logs id={invoice.id} />
                }

                {
                  invoice.recipt &&
                  <Button className="m-0 px-2" onClick={() => {
                    window.open(`https://opp.pharmacube.in${invoice.recipt}`, "_blank", "noopener,noreferrer")
                  }}>Recipt</Button>
                }
                {
                  (!Boolean(invoice.urgent) && invoice.status < 6) && <Button onClick={() => handleClick(invoice.id)}>
                    Urgent
                  </Button>
                }
                {
                  invoice.status < 7 &&
                  <Button onClick={() => setOpenMove(true)}>
                    Move invoice
                  </Button>
                }
              </div>

              <Dialog open={openMove} onOpenChange={setOpenMove}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Move Invoice</DialogTitle>
                    <DialogDescription>
                      Choose the stage you want to move this invoice to. Relevant logs will be regenerated based on the selected stage.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="text-lg">
                    Invoice No: <span className="text-orange-600 font-bold">{invoice.GSTVno}</span>
                  </div>
                  <div className="">
                    Current stage: <span className="text-orange-600 font-bold">{STAGE_LABEL[invoice.status]}</span>
                  </div>

                  <FieldGroup className="grid grid-cols-[10%_90%] mb-4">
                    <div className="my-auto">Stage:</div>

                    <Select onValueChange={(value) => { setStage(Number(value)) }}>
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select a stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Stages</SelectLabel>
                          <SelectItem value="0">Warehouse</SelectItem>
                          <SelectItem value="1">Checking</SelectItem>
                          <SelectItem value="2">Review</SelectItem>
                          <SelectItem value="3">Accounts/Rider</SelectItem>
                          <SelectItem value="6">Delivery</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                  </FieldGroup>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button onClick={() => handleSubmit(invoice.id)}>Submit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </AccordionContent>
          </AccordionItem>
        </Accordion >
      ))}
    </>
  );
};

export default InvoiceCard;