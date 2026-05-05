"use client";

import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { IndianRupee } from "lucide-react";
import { Button } from "./ui/button";
import InvoiceTableActions from "./invoiceTableActions";

export const STATUS_LABEL: Record<number, string> = {
  0: "Pending",
  1: "Sent to Checker",
  2: "Check Passed",
  3: "Assigned for Delivery",
  4: "Accepted for Delivery",
  5: "Out for Delivery",
  6: "Delivered",
  7: "Delivery Verified",
  8: "Delivered with Discrepancy",
  9: "Discrepancy Raised",
  10: "Discrepancy Resolved",
};

export const invoiceColumns: ColumnDef<InvoiceData>[] = [
  {
    id: "sno",
    header: "S.No",
    size: 40,
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "Vdt",
    header: "Date",
    size: 80,
    cell: ({ row }) => {
      const value = row.getValue("Vdt") as string;
      const date = new Date(value);
      return date.toLocaleDateString("en-GB");
    },
  },
  {
    accessorKey: "mTime",
    header: "Time",
    size: 80,
  },
  {
    accessorKey: "GSTVno",
    header: "GSTVno",
    size: 80,
  },
  {
    accessorKey: "partyName",
    header: "Party Name",
    size: 300,
  },
  {
    accessorKey: "NoOfItem",
    header: "No of Items",
    size: 80,
  },
  {
    accessorKey: "InvAmt",
    header: "Amount",
    size: 80,
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
      const VNo = row.original.Vno as string;
      const Vtyp = row.original.Vtyp as string;
      const discrepancy = row.original.status;
      return (
        <div className="flex items-center">
          <Button className="m-0 px-2" onClick={() => {
            window.open(`/invoice/${Vtyp}-${VNo}`, "_blank", "noopener,noreferrer")
          }}>
            View
          </Button>
          {
            (discrepancy === 10  && 
              <InvoiceTableActions VNo={VNo} Vtyp={Vtyp}/>
            )
          }
        </div>
      )
    },
  },
];