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
import { fetchLogs, fetchRiderLogs } from "@/lib/actions/admin"
import { OperationLog, RiderLocationLog } from "@/utils/types/DataTypes"
import { useEffect, useState } from "react"

const Logs = ({ id }: {
    id: number;
}) => {
    const [open, setOpen] = useState(false);
    const [openActionLogs, setOpenActionLogs] = useState(false);
    const [data, setData] = useState<OperationLog | null>(null);
    const [riderData, setRiderData] = useState<RiderLocationLog[] | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!open) return
            const res = await fetchLogs(id);
            if (!res?.success) {
                alert("Failed to fetch logs.")
                return;
            }
            setData(res?.data || null);
        }
        loadData()
    }, [open])

    useEffect(() => {
        const loadData = async () => {
            if (!openActionLogs) return
            const res = await fetchRiderLogs(id);
            if (!res?.success) {
                alert("Failed to fetch logs.")
                return;
            }
            setRiderData(res?.data || null);
        }
        loadData()
    }, [openActionLogs])

    const accepted = riderData?.find(log => log.action === "accepted");
    const picked = riderData?.find(log => log.action === "picked");
    const delivered = riderData?.find(log => log.action === "delivered");

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
                        <span className="capitalize">: {data?.warehouse_name ?? "NA"} - {data?.warehouse_time ? new Date(data.warehouse_time).toLocaleString() : "NA"}</span>

                        <span>Checked by</span>
                        <span className="capitalize">: {data?.checker_name ?? "NA"} - {data?.checker_time ? new Date(data.checker_time).toLocaleString() : "NA"}</span>

                        <span>Reviewed by</span>
                        <span className="capitalize">: {data?.reviewer_name ?? "NA"} - {data?.reviewer_time ? new Date(data.reviewer_time).toLocaleString() : "NA"}</span>

                        <span>Assigned Rider</span>
                        <span className="capitalize">: {data?.rider_name ?? "NA"} - <span className="text-orange-600 font-semibold hover:cursor-pointer hover:underline" onClick={() => setOpenActionLogs(true)}>Action Logs</span></span>

                        <span>Delivery</span>
                        <span className="capitalize">: {data?.delivery_name ?? "NA"} - {data?.delivery_time ? new Date(data.delivery_time).toLocaleString() : "NA"}</span>

                        <span>Account</span>
                        <span className="capitalize">: {data?.account_name ?? "NA"} - {data?.account_time ? new Date(data.account_time).toLocaleString() : "NA"}</span>

                        <span>Discrepancy</span>
                        <span className="capitalize font-semibold">: {data?.discrepancy_at === "no" ? "No" : `during ${data?.discrepancy_at}`} - {data?.discrepancy_time ? new Date(data.discrepancy_time).toLocaleString() : "NA"}</span>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openActionLogs} onOpenChange={setOpenActionLogs}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Rider Action Logs</DialogTitle>
                        <DialogDescription>
                            Review the rider actions.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="grid grid-cols-[30%_70%]">

                        <span>Accepted at</span>
                        <span>
                            : {accepted?.created_at
                                ? new Date(accepted.created_at).toLocaleString()
                                : "NA"}
                        </span>

                        <span>Picked at</span>
                        <span>
                            : {picked?.created_at
                                ? new Date(picked.created_at).toLocaleString()
                                : "NA"}
                        </span>

                        <span>Delivered at</span>
                        <span>
                            : {delivered?.created_at
                                ? new Date(delivered.created_at).toLocaleString()
                                : "NA"}
                        </span>

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