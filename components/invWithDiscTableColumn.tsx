"use client";

import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { IndianRupee } from "lucide-react";
import { Button } from "./ui/button";
import InvoiceTableActions from "./invoiceTableActions";
import { useRouter } from "next/navigation";
import { markAsUrgent } from "@/lib/actions/invoice";

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
      <div className="font-bold">Actions</div>
    ),
    cell: ({ row }) => {
      const VNo = row.original.Vno as string;
      const Vtyp = row.original.Vtyp as string;
      const recipt = row.original.recipt;
      const id = row.original.id
      const show = Boolean(row.original.urgent);
      const router = useRouter();
      const handleClick = async () => {

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
        <div className="flex items-center gap-1">
          <Button
            className="m-0 px-2"
            onClick={() => {
              window.open(`/invoice/${Vtyp}-${VNo}`, "_blank", "noopener,noreferrer");
            }}
          >
            Invoice
          </Button>
          {
            recipt &&
            <Button className="m-0 px-2" onClick={() => {
              window.open(`https://opp.pharmacube.in${recipt}`, "_blank", "noopener,noreferrer")
            }}>Recipt</Button>
          }
          <InvoiceTableActions VNo={VNo} Vtyp={Vtyp} />
          {
            !show && <Button onClick={handleClick}>
              Urgent
            </Button>
          }
        </div>
      );
    },
  }
];