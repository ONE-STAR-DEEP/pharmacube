"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "../ui/button";
import { UserData } from "@/utils/types/DataTypes";
import AddUser from "./AddUser";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRole } from "../UserContext";
import { toggleUserState } from "@/lib/actions/users";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, UserCheck } from "lucide-react";

const colorMap = {
  admin: "text-red-600",
  warehouse: "text-blue-600",
  checker: "text-yellow-600",
  reviewer: "text-purple-600",
  rider: "text-green-600",
  delivery: "text-gray-600",
};

const UserCard = ({ data }: { data: UserData[] }) => {

  const [disableOpen, setDisableOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handelToggleActive = async (id: number, isActive: boolean) => {

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


  return (
    <>
      {data.map((user) => (
        <Accordion
          key={user.id}
          type="single"
          collapsible

        >
          <AccordionItem value={`item-${user.id}`}>
            <AccordionTrigger>
              <span className="font-bold capitalize">{user.name}</span>
            </AccordionTrigger>

            <AccordionContent>
              {/* <p>{user.}</p> */}

              <div className="grid grid-cols-[30%_70%]">
                <span>Email</span>
                <span>: {user.email ?? "NA"}</span>

                <span>Mobile</span>
                <span>: {user.mobile}</span>

                <span>Role</span>
                <span className={`capitalize font-medium ${colorMap[user.type as keyof typeof colorMap]}`}>: {user.type}</span>

                <span>Status</span>
                <span>: {Boolean(user.active) ? "Active" : "Inactive"}</span>

                <span>Added on</span>
                <span>: {new Date(user.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 items-center justify-end mt-2">

                <Button className="h-8" onClick={() => handelToggleActive(user.id, Boolean(user.active))}>{Boolean(user.active) ? <><Ban /> Disable</> : <><UserCheck /> Enable</>}</Button>

                <div className="border border-primary rounded-sm px-2">
                  <AddUser mode="edit" id={user.id} />
                </div>

              </div>
            </AccordionContent>
          </AccordionItem>

          <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>{Boolean(user.active) ? <>Disable User?</> : <>Enable User?</>}</DialogTitle>
                <DialogDescription>
                  {Boolean(user.active) ?
                    <>Are you sure you want to disable this user? This user will not be able to access the system.</>
                    :
                    <>Are you sure you want to Enable this user? This user will be able to access the system.</>}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={() => handelToggleActive(user.id, Boolean(user.active))} disabled={loading}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Accordion >
      ))}
    </>
  );
};

export default UserCard;