"use client";
import { UserData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";

export const userColumns: ColumnDef<UserData>[] = [
  {
    id: "sno",
    header: "S.No",
    size: 40,
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
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
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return new Date(date).toLocaleDateString();
    },
  },
];