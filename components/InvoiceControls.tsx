"use client";

import { Button } from "@/components/ui/button";
import { approveInvoice } from "@/lib/actions/invoice";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react";

export default function InvoiceControls({ VNo, Vtyp }: { VNo: string, Vtyp: string }) {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState("");
    const [heading, setHeading] = useState("");

    const handleApprove = async () => {

        if(loading) return
        setLoading(true)
        try {
            const res = await approveInvoice(VNo, Vtyp);

            if (!res.success) {
                setMsg(res.message);
                setHeading("Action Not Allowed");
                setOpen(true)
                return
            }
            setMsg(res.message);
            setHeading("Invoice Approved");
            setOpen(true)
        } catch (error) {
            // console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center my-4 gap-4 print:hidden">

            <Button onClick={() => window.print()}>
                Print Invoice
            </Button>
            <Button onClick={handleApprove} disabled={loading}>{loading ? "Please wait..." : "Approve Invoice"}</Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{heading}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {msg}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.back()}>Return</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}