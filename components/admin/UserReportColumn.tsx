"use client";
import { UserActionReport, UserData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";


export const userReportColumns: ColumnDef<UserActionReport>[] = [
    {
        id: "sno",
        header: "S.No",
        size: 40,
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const name = row.getValue("name") as string;

            return (
                <span className={`capitalize font-medium`}>
                    {name}
                </span>
            );
        },
    },
    {
        accessorKey: "type",
        header: "Role",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;

            const colorMap = {
                admin: "text-red-600",
                warehouse: "text-blue-600",
                checker: "text-yellow-600",
                reviewer: "text-purple-600",
                rider: "text-green-600",
                delivery: "text-gray-600",
            };

            return (
                <span className={`capitalize font-medium ${colorMap[type as keyof typeof colorMap]}`}>
                    {type}
                </span>
            );
        },
    },
    {
        accessorKey: "warehouse",
        size: 120,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Warehouse
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "checker",
        size: 120,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Check
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "reviewer",
        size: 120,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Review
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "rider",
        size: 120,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Rider
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "delivery",
        size: 120,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Delivery
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "account",
        size: 120,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Account
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "urgentMarked",
        size: 120,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Urgent
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    }
];