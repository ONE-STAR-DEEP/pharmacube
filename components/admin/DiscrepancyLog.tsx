import { fetchRiderLogs } from '@/lib/actions/admin';
import { RiderLocationLog } from '@/utils/types/DataTypes';
import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from '../ui/field';
import { Button } from '../ui/button';

const DiscrepancyLog = ({ id }: { id: number }) => {

    const [openActionLogs, setOpenActionLogs] = useState(false);
    const [riderData, setRiderData] = useState<RiderLocationLog[] | null>(null);

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
            <span className="text-orange-600 font-semibold hover:cursor-pointer hover:underline" onClick={() => setOpenActionLogs(true)}>Action Logs</span>

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

export default DiscrepancyLog