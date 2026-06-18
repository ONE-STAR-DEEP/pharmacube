"use client";

import { DiscrepancyInvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { IndianRupee } from "lucide-react";
import { Discrepancy_LABEL } from "../invWithDiscTableColumn";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "../ui/field";
import DicsrepancyView from "./DicsrepancyView";
import { Label } from "../ui/label";
import DiscrepancyLog from "./DiscrepancyLog";

export const STATUS_LABEL: Record<number, string> = {
  0: "Pending",
  1: "Sent to Checker",
  2: "Check Passed",
  3: "Assigned for Delivery",
  4: "Accepted for Delivery",
  5: "Out for Delivery",
  6: "Delivered",
  7: "Client Delivery Confirmed",
  8: "Delivered with Discrepancy",
  9: "Discrepancy Raised",
  10: "Discrepancy Resolved",
};

export const invoiceColumns: ColumnDef<DiscrepancyInvoiceData>[] = [
  {
    id: "sno",
    header: "S.No",
    size: 40,
    cell: ({ row }) => {

      const searchParams = useSearchParams();
      const page = Number(searchParams.get("page"));
      const limit = Number(searchParams.get("limit"));
      return (((page - 1) * limit) + (row.index + 1))
    }
  },
  {
    accessorKey: "GSTVno",
    header: "GSTVno",
    size: 120
  },
  {
    accessorKey: "Vdt",
    header: "Date",
    cell: ({ row }) => {
      const value = row.getValue("Vdt") as string;
      const date = new Date(value);
      const formatted = date.toLocaleDateString("en-GB");
      return formatted;
    },
    size: 100
  },
  {
    accessorKey: "mTime",
    header: "Time",
    size: 80
  },
  {
    accessorKey: "partyName",
    header: "Party Name",
    size: 300
  },
  {
    accessorKey: "NoOfItem",
    header: "Items",
    size: 80
  },
  {
    accessorKey: "InvAmt",
    header: "Amount",
    size: 100,
    cell: ({ row }) => {
      const value = row.getValue("InvAmt") as string;
      return (
        <div className="flex items-center" >
          <IndianRupee size={12} />
          <p>
            {value}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "discrepancy",
    header: "Discrepancy",
    size: 80,
    cell: ({ row }) => {
      const value = Number(row.original.discrepancy);

      const colorMap = {
        0: "text-green-600",
        1: "text-red-600",
        2: "text-blue-600",
      };
      return (
        <div className="flex items-center">
          <p className={`capitalize font-medium ${colorMap[value as keyof typeof colorMap]}`}>
            {Discrepancy_LABEL[value]}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 160,
    cell: ({ row }) => {
      const value = row.getValue("status") as number;

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

      return (
        <div className="flex items-center">
          <p className={`capitalize font-medium ${colorMap[value as keyof typeof colorMap]}`}>
            {STATUS_LABEL[value]}
          </p>
        </div>
      )
    },
  },
  {
    id: "action",
    header: "Action",
    size: 120,
    cell: ({ row }) => {
      const sp1_id = row.original.sp1_id;
      const VNo = row.original.Vno;
      const Vtyp = row.original.Vtyp;
      const marked_at = row.original.marked_at;
      const marked_by = row.original.marked_by;
      const resolved_by = row.original.resolved_by;
      const found_at = row.original.found_at;

      const warehouse = row.original.warehouse;
      const checker = row.original.checker;
      const reviewer = row.original.reviewer;
      const rider = row.original.rider;
      const delivery = row.original.delivery;

      const warehouse_time = row.original.warehouse_time;
      const checker_time = row.original.checker_time;
      const reviewer_time = row.original.reviewer_time;
      const delivery_time = row.original.delivery_time;

      const [open, setOpen] = useState(false);

      return (
        <div className="flex items-center gap-1">

          <DicsrepancyView Vno={VNo} Vtyp={Vtyp} />

          <Button onClick={() => setOpen(true)}>Logs</Button>

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
                <span className="capitalize">: {warehouse ?? "NA"} - {warehouse_time ? new Date(warehouse_time).toLocaleString() : "NA"}</span>

                <span>Checked by</span>
                <span className="capitalize">: {checker ?? "NA"} - {checker_time ? new Date(checker_time).toLocaleString() : "NA"}</span>

                <span>Reviewed by</span>
                <span className="capitalize">: {reviewer ?? "NA"} - {reviewer_time ? new Date(reviewer_time).toLocaleString() : "NA"}</span>

                <span>Assigned Rider</span>
                <span className="capitalize flex gap-1">: {rider ?? "NA"} - <DiscrepancyLog id={sp1_id} /></span>

                <span>Delivery</span>
                <span className="capitalize">: {delivery ?? "NA"} - {delivery_time ? new Date(delivery_time).toLocaleString() : "NA"}</span>

              </FieldGroup>

              <Label className="text-lg">Discrepancy</Label>
              <FieldGroup className="grid grid-cols-[30%_70%]">
                <span>Discrepancy</span>
                <span className="">: {found_at ? `During ${found_at}` : "NA"}</span>

                <span>Marked by</span>
                <span className="capitalize">: {marked_by ? marked_by : "NA"}</span>

                <span>Marked at</span>
                <span className="capitalize">: {marked_at ? new Date(marked_at).toLocaleString() : "NA"}</span>

                <span>Resolved by</span>
                <span className="capitalize">: {resolved_by ? resolved_by : "NA"}</span>

              </FieldGroup>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      )
    },
  },
];