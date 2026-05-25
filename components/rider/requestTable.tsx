"use client";

import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import InvoiceTableActions from "../invoiceTableActions";

export const STATUS_LABEL: Record<number, string> = {
  0: "Pending",
  1: "Sent to Checker",
  2: "Check Passed",
  3: "Reviewed",

  10: "Discrepancy",
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
    accessorKey: "partyName",
    header: "Party Name",
    size: 300,
  },
  {
    accessorKey: "NoOfItem",
    header: "No of Items",
    size: 80,
  },
  // {
  //   accessorKey: "InvAmt",
  //   header: "Amount",
  //   size: 100,
  //   cell: ({ row }) => {
  //     const value = row.getValue("InvAmt") as string;
  //     return (
  //       <div className="flex items-center" >
  //         <IndianRupee size={12} />
  //         <p>
  //           {value}</p>
  //       </div>
  //     )
  //   },
  // },
  // {
  //   accessorKey: "discrepancy",
  //   header: "Discrepancy",
  //   size: 80,
  //   cell: ({ row }) => {
  //     const value = row.getValue("discrepancy") as string;
  //     return (
  //       <div className="flex items-center" >
  //         <p className={`${value ? "text-red-600" : "text-green-600"}`}>
  //           {value ? "Yes" : "No"}</p>
  //       </div>
  //     )
  //   },
  // },
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
          <Button className="m-0 px-2"
            onClick={() => {
              window.open(`/invoice/${VNo}`, "_blank", "noopener,noreferrer")
            }}>
            View
          </Button>
          <InvoiceTableActions VNo={VNo} Vtyp={Vtyp} />
        </div>
      );
    },
  }
];