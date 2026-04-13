"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ViewButton } from "./ViewButton"

export type BillStructure = {
    "Bill No": string
    name: string
    "Make Time": string
    Dated: string
    "Gross Amt": number
    "Inv Amt": number
    "No Of Items": number
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(value)

export const columns: ColumnDef<BillStructure>[] = [
    {
        id: "sno",
        header: () => <div className="w-8 text-center">S.No</div>,
        cell: ({ row }) => {
            return (
                <div className="text-center w-8 font-medium">
                    {row.index + 1}
                </div>
            )
        },
    },
    {
        accessorKey: "Bill No",
        header: "Bill No.",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "Make Time",
        header: "Make Time",
    },
    {
        accessorKey: "Dated",
        header: "Dated",
    },
    {
        accessorKey: "Gross Amt",
        header: () => <div className="text-right">Gross Amount</div>,
        cell: ({ row }) => {
            const value = row.getValue("Gross Amt") as number

            return (
                <div className="text-right font-medium">
                    {formatCurrency(value)}
                </div>
            )
        },
    },
    {
        accessorKey: "Inv Amt",
        header: () => <div className="text-right">Invoice Amount</div>,
        cell: ({ row }) => {
            const value = row.getValue("Inv Amt") as number

            return (
                <div className="text-right font-semibold">
                    {formatCurrency(value)}
                </div>
            )
        },
    },
    {
        accessorKey: "No Of Items",
        header: () => <div className="text-right">Number of Items</div>,
        cell: ({ row }) => {
            const value = row.getValue("No Of Items") as number

            return (
                <div className="text-right font-semibold tabular-nums">
                    {value}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center w-25">Actions</div>,
        cell: ({ row }) => {
            const billNo = row.getValue("Bill No")  as string

            return (
                <div className="flex justify-center w-25">
                    <ViewButton billNo={billNo}/>
                </div>
            )
        },
    }
]