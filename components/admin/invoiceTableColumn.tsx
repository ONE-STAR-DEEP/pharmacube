"use client";
import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { IndianRupee } from "lucide-react";
import { Discrepancy_LABEL } from "../invWithDiscTableColumn";
import { markAsUrgent } from "@/lib/actions/invoice";

export const STATUS_LABEL: Record<number, string> = {
  0: "Pending",
  1: "Sent to Checker",
  2: "Sent to Reviewer",
  3: "Reviewer Approved",
  4: "Accepted for Delivery",
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

export const invoiceColumns: ColumnDef<InvoiceData>[] = [
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
    size: 280
  },
  {
    accessorKey: "NoOfItem",
    header: "Items",
    size: 50
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
    accessorKey: "payment",
    header: "Payment",
    size: 70,
    cell: ({ row }) => {
      const value = Boolean(row.getValue("payment"));
      return (
        <div className="flex items-center" >
          <p className={`${value ? "text-emerald-700" : "text-orange-600"} font-semibold`}>
            {value ? "paid" : "pending"}</p>
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
            {Discrepancy_LABEL[value]}</p>
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

      if (value === 2) {

      }

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
        190: "text-red-600",
        200: "text-emerald-600",
        210: "text-amber-600"
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
    cell: ({ row }) => {
      const VNo = row.original.Vno;
      const id = row.original.id
      const Vtyp = row.original.Vtyp;
      const recipt = row.original.recipt;
      const router = useRouter();
      const show = Boolean(row.original.urgent);
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
        <div className="flex gap-2 items-center">
          <Button className="m-0 px-2" onClick={() => {
            window.open(`/invoice/${Vtyp}-${VNo}`, "_blank", "noopener,noreferrer")
          }}>
            View
          </Button>
          {
            recipt &&
            <Button className="m-0 px-2" onClick={() => {
              window.open(`https://opp.pharmacube.in${recipt}`, "_blank", "noopener,noreferrer")
            }}>Recipt</Button>
          }
          {
            !show && <Button onClick={handleClick}>
              Urgent
            </Button>
          }
        </div>
      )
    },
  },
];