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

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { Users, FileText, LogOut, Home, LayoutDashboard, FileX, Key, FileUser } from "lucide-react";
import Image from "next/image";
import { logout } from "@/lib/logout";
import { usePathname } from "next/navigation"

export function AppSidebar() {

    const pathname = usePathname();

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

        <Sidebar
            variant="sidebar"
            className="mt-12 h-[calc(100vh-3rem)] flex flex-col "
        >
            {/* Header */}
            <SidebarHeader className="px-4 text-lg font-semibold hover:cursor-default">
                <div className="flex items-center">

                    <Image
                        src="/logo.png"
                        alt="logo"
                        height={50}
                        width={50}
                    />
                    <p>
                        Pharma Cube
                    </p>
                </div>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="flex-1 px-2">

                <SidebarGroup>
                    <SidebarMenu>

                        <SidebarMenuItem>
                            <Link
                                href="/reviewer/dashboard"
                                className={`${pathname === "/reviewer/dashboard" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link
                                href="/reviewer/dashboard/check"
                                className={`${pathname === "/reviewer/dashboard/check" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}

                            >
                                <FileText size={18} />
                                <span>Check Invoices</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Invoices */}
                        <SidebarMenuItem>
                            <Link
                                href="/reviewer/dashboard/invoices"
                                className={`${pathname === "/reviewer/dashboard/invoices" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}

                            >
                                <FileText size={18} />
                                <span>Attended Invoices</span>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link
                                href="/reviewer/dashboard/clientDelivery"
                                className={`${pathname === "/reviewer/dashboard/clientDelivery" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}
                            >
                                <FileUser size={18} />
                                <span>CDC</span>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link
                                href="/reviewer/dashboard/discrepancies"
                                className={`${pathname === "/reviewer/dashboard/discrepancies" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}
                            >
                                <FileX size={18} />
                                <span>Discrepancies</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Change Password */}
                        <SidebarMenuItem>
                            <button
                                onClick={() => { setOpen(true) }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition text-left hover:bg-primary/50 hover:text-white hover:cursor-pointer"
                            >
                                <Key size={18} />
                                <span>Change Password</span>
                            </button>
                        </SidebarMenuItem>

                        {/* Logout */}
                        <SidebarMenuItem>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition text-left hover:bg-red-300 hover:cursor-pointer"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>

                <div>
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

            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="px-4 text-sm text-muted-foreground">
                © Pharma Cube
            </SidebarFooter>
        </Sidebar>
    )
}