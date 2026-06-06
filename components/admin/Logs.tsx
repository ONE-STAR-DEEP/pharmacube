"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { fetchLogs } from "@/lib/actions/admin"
import { OperationLog } from "@/utils/types/DataTypes"
import { useEffect, useState } from "react"

const Logs = ({ id, Vno, Vtyp }: {
    id: number;
    Vno: number;
    Vtyp: string;
}) => {

    const [open, setOpen] = useState(false);
    const [data, setData] = useState<OperationLog | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!open) return
            const res = await fetchLogs(id);
            console.log(res?.data)
            if (!res?.success) {
                alert("Failed to fetch logs.")
                return;
            }
            setData(res?.data || null);
        }
        loadData()
    }, [open])

    return (
        <div>
            <Button onClick={() => setOpen(true)}>Logs</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Operation Logs</DialogTitle>
                        <DialogDescription>
                            Review the complete history of operations and the workers involved.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="grid grid-cols-[30%_70%]">

                        <span>Warehouse</span> 
                        <span>: {data?.warehouse_name ?? "NA"}</span> 

                        <span>Checked by</span> 
                        <span>: {data?.checker_name ?? "NA"}</span> 

                        <span>Reviewed by</span> 
                        <span>: {data?.reviewer_name ?? "NA"}</span> 

                        <span>Assigned Rider</span> 
                        <span>: {data?.rider_name ?? "NA"}</span> 

                        <span>Delivery</span> 
                        <span>: {data?.delivery_name ?? "NA"}</span> 

                        <span>Account</span> 
                        <span>: {data?.account_name ?? "NA"}</span> 

                        <span>Discrepancy</span> 
                        <span className="capitalize font-semibold">: {data?.discrepancy_at === "no" ? "No" : `during ${data?.discrepancy_at}`}</span> 

                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>

            </Dialog>

        </div>
    )
}

export default Logs