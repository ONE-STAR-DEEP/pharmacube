"use client"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { tnxDetails } from "@/lib/actions/account"

const Tnx = ({ invoiceId }: { invoiceId: number }) => {

    const [data, setData] = useState<any | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!open) return;
            try {
                const tnx = await tnxDetails(invoiceId);
                if (!tnx.success) {
                    alert("Failed to fetch data Try Again");
                    setOpen(false);
                    return;
                }
                setData(tnx.data)
            } catch (error) {
                console.log(error);
            }
        }
        loadData();
    }, [open, invoiceId]);

    return (
        <div>
            <Button onClick={() => { setOpen(true) }} className="ml-2">Tnx</Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="
                            sm:max-w-md
                            p-4
                            "
                >
                    <DialogHeader className="">
                        <DialogTitle className="text-xl">Tnx Details</DialogTitle>
                        <DialogDescription className="text-base">
                            Invoice No: {data?.GSTVno ?? ""}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-[30%_70%] text-lg">

                        <span>Amount</span>
                        <span>: ₹{data?.amount}</span>

                        <span>Mode</span>
                        <span>: {data?.mode}</span>

                        <span>Date</span>
                        <span>
                            : {new Date(data?.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>

                        <span>Remark</span>
                        <span>: {data?.remark}</span>

                    </div>

                    <div className="p-2 pt-4 flex justify-end gap-3">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Close</Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Tnx