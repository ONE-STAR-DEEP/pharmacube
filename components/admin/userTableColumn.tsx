"use client";
import { UserData } from "@/utils/types/DataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { useRole } from "../UserContext";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Ban, Edit, EllipsisVertical, Trash, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddUser from "./AddUser";
import { toggleUserState } from "@/lib/actions/users";


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
  {
    accessorKey: "active",
    header: "isActive",
    cell: ({ row }) => {

      const isActive = Boolean(row.original.active);

      return (
        <div>

          {
            isActive ?
              <p className="text-green-500">Yes</p>
              :
              <p className="text-red-500">No</p>
          }
        </ div>
      )
    }
  },
  {
    accessorKey: "id",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.getValue("id") as number;
      const isActive = Boolean(row.original.active);

      const [disableOpen, setDisableOpen] = useState(false)
      const [loading, setLoading] = useState(false);
      const router = useRouter();

      const handelToggleActive = async () => {

        if (loading) return
        setLoading(true);
        try {
          const res = await toggleUserState(id, !isActive);
          if (!res.success) {
            alert(res.message);
            return;
          }
          router.refresh()
        } catch (error) {
          console.log(error)
        } finally {
          setDisableOpen(false);
          setLoading(false)
        }
      }

      const { role } = useRole();

      if (role === "admin")
        return (
          <div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="no-print p-2"><EllipsisVertical /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <AddUser mode="edit" id={id} />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDisableOpen(true)}>
                    {isActive ? <><Ban /> Disable</> : <><UserCheck /> Enable</>}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>{isActive ? <>Disable User?</> : <>Enable User?</>}</DialogTitle>
                  <DialogDescription>
                    {isActive ? 
                    <>Are you sure you want to disable this user? This user will not be able to access the system.</> 
                    : 
                    <>Are you sure you want to Enable this user? This user will be able to access the system.</>}
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" onClick={() => handelToggleActive()} disabled={loading}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      else {
        return (
          <div>Not Allowed</div>
        )
      }
    },
  },
];