"use client"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { FormEvent, useState } from 'react'
import { Button } from '../ui/button'
import { Field, FieldGroup, FieldLabel } from "../ui/field"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { changePassword } from "@/lib/actions/users"

const ChangePassword = () => {

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("")
    const [alertBox, setAlertBox] = useState(false)
    const [alertTitle, setAlertTitle] = useState("")

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (loading) return;
        setLoading(true);
        try {
            const res = await changePassword(currentPassword, newPassword);
            if (!res.success) {
                setMsg(res.message)
                setAlertBox(true)
                setAlertTitle("Failed to Change Password!!!")
                return
            }
            setOpen(false)
            setMsg(res.message)
                setAlertBox(true)
                setAlertTitle("Alert!!!")
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }

    }

    return (
        <div>
            <Button onClick={() => { setOpen(true) }}>Change Password</Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="
                            sm:max-w-md
                            "
                >
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="">
                            <DialogTitle className="text-xl">Change Password</DialogTitle>
                            <DialogDescription>
                                Fill both of the Fields to change Password.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="">

                            <FieldLabel className="text-lg mt-2 text-primary">

                            </FieldLabel>
                            <FieldGroup className="mt-4">

                                <Field className="gap-0">
                                    <div className="flex ">
                                        <Label htmlFor="currentPassword" className="">Current Password</Label>
                                        <span className="text-red-500 ">*</span>
                                    </div>
                                    <Input id="currentPassword" name="currentPassword" placeholder="Current Password" required
                                        className="h-10"
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </Field>

                                <Field className="gap-0">
                                    <div className="flex ">
                                        <Label htmlFor="newPassword" className="">New Password</Label>
                                        <span className="text-red-500 ">*</span>
                                    </div>
                                    <Input id="newPassword" name="newPassword" placeholder="New Password" required
                                        className="h-10"
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </Field>

                            </FieldGroup>
                        </div>

                        <div className="p-2 pt-4 flex justify-end gap-3">
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>Submit</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={alertBox} onOpenChange={setAlertBox}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {msg}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}

export default ChangePassword