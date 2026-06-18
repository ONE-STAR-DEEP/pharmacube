"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { DiscrepancyInvoiceData, RiderLocationLog } from "@/utils/types/DataTypes"
import { Button } from "../ui/button";
import { FieldGroup } from "../ui/field";
import { useEffect, useState } from "react";
import DicsrepancyView from "./DicsrepancyView";
import { Label } from "../ui/label";
import { fetchRiderLogs } from "@/lib/actions/admin";
import DiscrepancyLog from "./DiscrepancyLog";

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

const DiscrepancyCard = ({ data }: { data: DiscrepancyInvoiceData[] }) => {

  const [open, setOpen] = useState(false);

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

              <div className="flex items-center justify-end gap-1">

                <DicsrepancyView Vno={invoice.Vno} Vtyp={invoice.Vtyp} />

                <Button onClick={() => setOpen(true)}>Logs</Button>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Discrepancy Logs</DialogTitle>
                    <DialogDescription>
                      Audit discrepancy records by user, timestamp, and processing stage.
                    </DialogDescription>
                  </DialogHeader>

                  <Label className="text-lg">Processing</Label>
                  <FieldGroup className="grid grid-cols-[30%_70%]">
                    <span>Warehouse</span>
                    <span className="capitalize">: {invoice.warehouse ?? "NA"} - {invoice.warehouse_time ? new Date(invoice.warehouse_time).toLocaleString() : "NA"}</span>

                    <span>Checked by</span>
                    <span className="capitalize">: {invoice.checker ?? "NA"} - {invoice.checker_time ? new Date(invoice.checker_time).toLocaleString() : "NA"}</span>

                    <span>Reviewed by</span>
                    <span className="capitalize">: {invoice.reviewer ?? "NA"} - {invoice.reviewer_time ? new Date(invoice.reviewer_time).toLocaleString() : "NA"}</span>

                    <span>Assigned Rider</span>
                    <span className="capitalize flex gap-1">: {invoice.rider ?? "NA"} - <DiscrepancyLog id={invoice.id} /></span>

                    <span>Delivery</span>
                    <span className="capitalize">: {invoice.delivery ?? "NA"} - {invoice.delivery_time ? new Date(invoice.delivery_time).toLocaleString() : "NA"}</span>

                  </FieldGroup>

                  <Label className="text-lg">Discrepancy</Label>
                  <FieldGroup className="grid grid-cols-[30%_70%]">
                    <span>Discrepancy</span>
                    <span className="">: {invoice.found_at ? `During ${invoice.found_at}` : "NA"}</span>

                    <span>Marked by</span>
                    <span className="capitalize">: {invoice.marked_by ? invoice.marked_by : "NA"}</span>

                    <span>Marked at</span>
                    <span className="capitalize">: {invoice.marked_at ? new Date(invoice.marked_at).toLocaleString() : "NA"}</span>

                    <span>Resolved by</span>
                    <span className="capitalize">: {invoice.resolved_by ? invoice.resolved_by : "NA"}</span>

                  </FieldGroup>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
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

export default DiscrepancyCard;