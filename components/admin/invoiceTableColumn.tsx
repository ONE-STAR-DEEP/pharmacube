"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { FieldGroup } from "@/components/ui/field"
import { changeStage, fetchLogs, fetchRiderLogs } from "@/lib/actions/admin"
import { OperationLog, RiderLocationLog } from "@/utils/types/DataTypes"
import { useEffect, useState } from "react"

import { InvoiceData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { EllipsisVertical, FileImage, IndianRupee } from "lucide-react";
import { Discrepancy_LABEL } from "../invWithDiscTableColumn";
import { markAsUrgent } from "@/lib/actions/invoice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    size: 100,
    cell: ({ row }) => {
      const VNo = Number(row.original.Vno);
      const id = row.original.id
      const Vtyp = row.original.Vtyp;
      const recipt = row.original.recipt;
      const GSTVno = row.original.GSTVno;
      const router = useRouter();
      const show = Boolean(row.original.urgent);
      const status = Number(row.original.status);
      const [open, setOpen] = useState(false);
      const [openMove, setOpenMove] = useState(false);
      const [stage, setStage] = useState(0)
      const [stageLoading, setStageLoading] = useState(false)
      const [openActionLogs, setOpenActionLogs] = useState(false);
      const [data, setData] = useState<OperationLog | null>(null);
      const [riderData, setRiderData] = useState<RiderLocationLog[] | null>(null);

      const handleClick = async () => {
        try {
          const res = await markAsUrgent(id)
          if (!res.success) {
            alert("Failed to update. Try again.")
            return
          }
          router.refresh()
        } catch (error) {
          console.log(error)
        }
      }

      useEffect(() => {
        const loadData = async () => {
          if (!open) return
          const res = await fetchLogs(id);
          if (!res?.success) {
            alert("Failed to fetch logs.")
            return;
          }
          setData(res?.data || null);
        }
        loadData()
      }, [open])

      useEffect(() => {
        const loadData = async () => {
          if (!openActionLogs) return
          const res = await fetchRiderLogs(id);
          if (!res?.success) {
            alert("Failed to fetch logs.")
            return;
          }
          setRiderData(res?.data || null);
          console.log(res?.data);
          console.log(riderData);
        }
        loadData()
      }, [openActionLogs])

      const handleSubmit = async () => {
        if (stageLoading) return;
        setStageLoading(true)
        try {
          const res = await changeStage(id, stage)
          if (!res.success) {
            alert("Failed to update. Try again.")
            return
          }
          router.refresh()
          setOpenMove(false)
        } catch (error) {
          console.log(error)
        } finally {
          setStageLoading(false)
        }
      }

      const accepted = riderData?.find(log => log.action === "accepted");
      const picked = riderData?.find(log => log.action === "picked");
      const delivered = riderData?.find(log => log.action === "delivered");

      return (
        <div className="flex items-center">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost"><EllipsisVertical /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => {
                    window.open(`/invoice/${Vtyp}-${VNo}`, "_blank", "noopener,noreferrer")
                  }}>
                  View Invoice
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setOpen(true)}>
                  Logs
                </DropdownMenuItem>

                {
                  status < 7 &&
                  <DropdownMenuItem onClick={() => setOpenMove(true)}>
                    Move invoice
                  </DropdownMenuItem>
                }

                {
                  (!show && status < 6) && <DropdownMenuItem onClick={handleClick}>
                    Mark Urgent
                  </DropdownMenuItem>
                }

              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {
            recipt &&
            <Button variant={"ghost"} onClick={() => {
              window.open(`https://opp.pharmacube.in${recipt}`, "_blank", "noopener,noreferrer")
            }}>
              <FileImage className="" />
            </Button>
          }

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Operation Logs</DialogTitle>
                <DialogDescription>
                  Review the complete history of operations and the workers involved.
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="grid grid-cols-[30%_70%]">
                <span>Warehouse</span>
                <span className="capitalize">: {data?.warehouse_name ?? "NA"} - {data?.warehouse_time ? new Date(data.warehouse_time).toLocaleString() : "NA"}</span>

                <span>Checked by</span>
                <span className="capitalize">: {data?.checker_name ?? "NA"} - {data?.checker_time ? new Date(data.checker_time).toLocaleString() : "NA"}</span>

                <span>Reviewed by</span>
                <span className="capitalize">: {data?.reviewer_name ?? "NA"} - {data?.reviewer_time ? new Date(data.reviewer_time).toLocaleString() : "NA"}</span>

                <span>Assigned Rider</span>
                <span className="capitalize">: {data?.rider_name ?? "NA"} - <span className="text-orange-600 font-semibold hover:cursor-pointer hover:underline" onClick={() => setOpenActionLogs(true)}>Action Logs</span></span>

                <span>Delivery</span>
                <span className="capitalize">: {data?.delivery_name ?? "NA"} - {data?.delivery_time ? new Date(data.delivery_time).toLocaleString() : "NA"}</span>

                <span>Account</span>
                <span className="capitalize">: {data?.account_name ?? "NA"} - {data?.account_time ? new Date(data.account_time).toLocaleString() : "NA"}</span>

                <span>Discrepancy</span>
                <span className="capitalize font-semibold">: {data?.discrepancy_at === "no" ? "No" : `during ${data?.discrepancy_at}`} - {data?.discrepancy_time ? new Date(data.discrepancy_time).toLocaleString() : "NA"}</span>
              </FieldGroup>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openMove} onOpenChange={setOpenMove}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Move Invoice</DialogTitle>
                <DialogDescription>
                  Choose the stage you want to move this invoice to. Relevant logs will be regenerated based on the selected stage.
                </DialogDescription>
              </DialogHeader>

              <div className="text-lg">
                Invoice No: <span className="text-orange-600 font-bold">{GSTVno}</span>
              </div>

              <FieldGroup className="grid grid-cols-[10%_90%]">
                <div className="my-auto">Stage:</div>

                <Select onValueChange={(value) => { setStage(Number(value)) }}>
                  <SelectTrigger className="w-full max-w-48">
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Stages</SelectLabel>
                      <SelectItem value="0">Warehouse</SelectItem>
                      <SelectItem value="1">Checking</SelectItem>
                      <SelectItem value="2">Review</SelectItem>
                      <SelectItem value="3">Accounts/Rider</SelectItem>
                      <SelectItem value="6">Delivery</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

              </FieldGroup>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button onClick={() => handleSubmit()}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openActionLogs} onOpenChange={setOpenActionLogs}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Rider Action Logs</DialogTitle>
                <DialogDescription>
                  Review the rider actions.
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="grid grid-cols-[30%_70%]">
                <span>Accepted at</span>
                <span>
                  : {accepted?.created_at
                    ? new Date(accepted.created_at).toLocaleString()
                    : "NA"}
                </span>
                <span>Picked at</span>
                <span>
                  : {picked?.created_at
                    ? new Date(picked.created_at).toLocaleString()
                    : "NA"}
                </span>

                <span>Delivered at</span>
                <span>
                  : {delivered?.created_at
                    ? new Date(delivered.created_at).toLocaleString()
                    : "NA"}
                </span>
              </FieldGroup>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div >
      )
    },
  },
];