"use client";

import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { IndianRupee } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import InvoiceTableActions from "./invoiceTableActions";

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
    accessorKey: "Vno",
    header: "Vno",
    size: 60,
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
    size: 120,
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
    id: "action",
    header: "Action",
    size: 120,
    cell: ({ row }) => {
      const value = row.getValue("Vno") as string;
      const router = useRouter();
      return (
        <div className="flex items-center gap-2">
          <Button className="m-0 px-2" onClick={() => {
            router.push(`/invoice/${value}/pending`)
          }}>
            View
          </Button>
          <InvoiceTableActions VNo={value}/>
        </div>
      )
    },
  },
];