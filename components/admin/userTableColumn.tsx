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
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddUser from "./AddUser";
import { deleteUser } from "@/lib/actions/users";


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
    accessorKey: "id",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.getValue("id") as number;

      const [deleteOpen, setDeleteOpen] = useState(false)
      const [loading, setLoading] = useState(false);
      const router = useRouter();

      const handelDelete = async () => {

        if(loading) return
        setLoading(true);
        try {
          const res = await deleteUser(id);
          if (!res.success) {
            alert(res.message);
            return;
          }
          router.refresh()
        } catch (error) {
          console.log(error)
        } finally {
          setDeleteOpen(false);
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
                    <AddUser mode="edit" id={id}/>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                    <Trash />Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this user? ALL details will be permanently removed.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" onClick={() => handelDelete()} disabled={loading}>Confirm</Button>
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