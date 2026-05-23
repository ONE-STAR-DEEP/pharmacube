"use client";

import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { IndianRupee } from "lucide-react";
import { Button } from "./ui/button";
import InvoiceTableActions from "./invoiceTableActions";
import { markAsUrgent } from "@/lib/actions/invoice";
import { useRouter } from "next/navigation";

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
    size: 110,
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
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const VNo = row.original.Vno as string;
      const Vtyp = row.original.Vtyp;
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
        <div className="flex items-center gap-2">
          <Button className="m-0 px-2" onClick={() => {
            window.open(`/invoice/${Vtyp}-${VNo}`, "_blank", "noopener,noreferrer")
          }}>
            View
          </Button>
          {
            !show && <Button onClick={handleClick}>
              Urgent
            </Button>
          }
          <InvoiceTableActions VNo={VNo} Vtyp={Vtyp} />
        </div>
      )
    },
  },
];