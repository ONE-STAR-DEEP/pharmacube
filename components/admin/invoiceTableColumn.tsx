"use client";
import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";

export const invoiceColumns: ColumnDef<InvoiceData>[] = [
  {
    id: "sno",
    header: "S.No",
    size: 30,
    cell: ({ row }) => row.index + 1,
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
  },
  {
    accessorKey: "Vno",
    header: "Vno",
  },
  {
    accessorKey: "GSTVno",
    header: "GSTVno",
  },
  {
    accessorKey: "partyName",
    header: "Party Name",
  },
  {
    accessorKey: "NoOfItem",
    header: "No of Items",
  },
  {
    accessorKey: "Amt01",
    header: "Amount",
  },
  {
    accessorKey: "",
    header: "Action",
  },
];