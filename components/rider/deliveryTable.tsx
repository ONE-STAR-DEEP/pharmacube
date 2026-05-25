"use client";

import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { IndianRupee } from "lucide-react";
import DeliveryCheckPopup from "../delivery/DeliveryCheckPopup";
import { Button } from "../ui/button";

export const Discrepancy_LABEL: Record<number, string> = {
  0: "No",
  1: "Yes",
  2: "Resolved",
};

export const invoiceColumns: ColumnDef<InvoiceData>[] = [
  {
    id: "sno",
    header: "S.No",
    size: 40,
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "GSTVno",
    header: "GSTVno",
    size: 120
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
      const value = row.getValue("discrepancy") as number;
      
      const colorMap = {
        0: "text-green-600",
        1: "text-red-600",
        2: "text-blue-600",
      };

      return (
        <div className="flex items-center">
          <p className={`capitalize font-medium ${colorMap[value as keyof typeof colorMap]}`}>
            {Discrepancy_LABEL[value]}</p>
        </div>
      )
    },
  },
  {
    id: "action",
    header: () => (
      <div className="text-center font-bold w-full">Actions</div>
    ),
    size: 150,
    cell: ({ row }) => {
      const VNo = row.original.Vno as string;
      const Vtyp = row.original.Vtyp as string;

      return (
        <div className="flex items-center justify-center gap-2 w-full">
          <Button
            className="m-0 px-2"
            onClick={() => {
              window.open(`/invoice/${Vtyp}-${VNo}`, "_blank", "noopener,noreferrer");
            }}
          >
            Invoice
          </Button>
          <DeliveryCheckPopup VNo={VNo} Vtyp={Vtyp}/>
        </div>
      );
    },
  }
];