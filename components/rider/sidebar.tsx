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
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import { FileText, LogOut, LayoutDashboard, Key, PackageCheck } from "lucide-react";
import Image from "next/image";
import { logout } from "@/lib/logout";

export function AppSidebar({ plus }: { plus: boolean }) {

    const { toggleSidebar } = useSidebar();
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

                        <SidebarMenuItem
                            onClick={() => { toggleSidebar() }}
                        >
                            <Link
                                href="/rider/dashboard"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <LayoutDashboard size={18} />
                                <span className="text-base font-medium">Dashboard</span>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem
                            onClick={() => { toggleSidebar() }}
                        >
                            <Link
                                href="/rider/dashboard/delivery"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <PackageCheck size={18} />
                                <span className="text-base font-medium">Delivery</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Invoices */}

                        <SidebarMenuItem>
                            <Accordion type="single" collapsible className="w-full hover:bg-muted border-none bg-transparent ">
                                <AccordionItem value="invoices" className="border-none bg-transparent data-open:bg-transparent">

                                    <AccordionTrigger className="p-0 decoration-transparent items-center" >
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-transparent hover:bg-muted transition w-full decoration-transparent">
                                            <FileText size={18} />
                                            <span className="text-base font-medium">Invoices</span>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="pl-8 v space-y-1 bg-transparent">
                                        <Link href="/rider/dashboard/invoices" className="block px-3 py-1 hover:bg-muted rounded-md no-underline decoration-transparent"
                                            onClick={toggleSidebar}
                                        >
                                            <span>All Invoices</span>
                                        </Link>
                                        <Link href="/rider/dashboard/invoices/accepted" className="block px-3 py-1 hover:bg-muted rounded-md no-underline decoration-transparent"
                                            onClick={toggleSidebar}
                                        >
                                            Accepted Invoices
                                        </Link>
                                        <Link href="/rider/dashboard/invoices/delivered" className="block px-3 py-1 hover:bg-muted rounded-md no-underline decoration-transparent"
                                            onClick={toggleSidebar}
                                        >
                                            Delivered
                                        </Link>
                                    </AccordionContent>

                                </AccordionItem>
                            </Accordion>
                        </SidebarMenuItem>

                        {/* Change Password */}
                        <SidebarMenuItem>
                            <button
                                onClick={() => { setOpen(true) }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition text-left"
                            >
                                <Key size={18} />
                                <span>Change Password</span>
                            </button>
                        </SidebarMenuItem>

                        {/* Logout */}
                        <SidebarMenuItem>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition text-left"
                            >
                                <LogOut size={18} />
                                <span className="text-base font-medium">Logout</span>
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