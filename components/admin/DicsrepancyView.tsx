"use client"

import { fetchDiscrepancyeByVNo, fetchDiscrepancyItems } from '@/lib/actions/invoice';
import { BillItem, Invoice } from '@/utils/types/DataTypes';
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
import { Label } from '../ui/label';
import { Field, FieldGroup } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const DicsrepancyView = ({ Vno, Vtyp }: { Vno: string; Vtyp: string }) => {

    const [items, setItems] = useState<BillItem[] | null>(null);
    const [open, setOpen] = useState(false)
    const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
    const [discrepancy, setDiscrepancy] = useState(false);

    useEffect(() => {
        if (!open || !Vno || !Vtyp) return;
        const loadData = async () => {
            setInvoiceData(null);
            setItems(null);
            try {
                setDiscrepancy(false)
                const res = await fetchDiscrepancyeByVNo(Vno, Vtyp);
                const invRes = await fetchDiscrepancyItems(Vno, Vtyp);

                console.log(res, invRes)

                if (!res.success && !invRes.success) {
                    alert("Failed to fetch data Try Again");
                    return;
                }

                setInvoiceData(res.data || null);
                setItems(invRes.data || [])
                setDiscrepancy((res?.data?.discrepancy === 1))
            } catch (error) {
                console.log(error);
            }
        }
        loadData()

    }, [open, Vno, Vtyp])

    return (
        <div>
            <Button onClick={() => { setOpen(true) }}>View</Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="w-full
                    max-w-[95vw]
                    sm:max-w-md
                    lg:max-w-[70vw]
                    min-h-[20vh]
                    max-h-[80vh] 
                    flex flex-col
                    p-4
                    overflow-y-auto
                    "
                >
                    <DialogHeader>
                        <DialogTitle className='text-2xl'>Invoice Discrepency</DialogTitle>
                        <DialogDescription>
                            Here you can see all discrepancy marked during checking stage.
                        </DialogDescription>
                        <h1 className='text-lg font-semibold mt-2'>Invoice No: <span className='text-orange-600'>{invoiceData?.['Bill No']}</span></h1>
                    </DialogHeader>

                    <FieldGroup className='hidden md:flex' >
                        <div className={`grid grid-cols-[40px_150px_1fr_100px_100px_100px_100px] gap-4 mb-0`}>
                            <Label>SNo</Label>
                            <Label>Batch No.</Label>
                            <Label className='min-w-60'>Particular</Label>
                            <Label>Current Qty</Label>
                            <Label>Changed to</Label>
                            <Label>Expiry</Label>
                            <Label>Updated Expiry</Label>
                        </div>

                        {items?.map((item, index) => (

                            <div key={item.id} className={`grid grid-cols-[40px_150px_1fr_100px_100px_100px_100px] gap-4 mb-0`}>

                                <Input
                                    name="Sno"
                                    defaultValue={index + 1}
                                    disabled
                                />
                                <Field>
                                    <Input
                                        name="batch"
                                        defaultValue={item['Batch No.']}
                                        className={`${(item.old_batch_no !== null) && (item['Batch No.'] !== item.old_batch_no) ? "bg-red-300 text-black" : ""}`}
                                        disabled
                                    />
                                </Field>

                                <Field>
                                    <Input
                                        name="particular"
                                        defaultValue={item.PARTICULARS}
                                        disabled
                                        className=''
                                    />
                                </Field>

                                <Field>
                                    <Input
                                        name="particular"
                                        defaultValue={item.old_Qty ? item.old_Qty : item.Qty}
                                        disabled
                                    />
                                </Field>

                                {invoiceData?.discrepancy === 1 &&
                                    <Field>
                                        <Input
                                            name="qty"
                                            defaultValue={item.Qty}
                                            disabled
                                            className={`${(item.old_Qty !== null) && (item.Qty !== item.old_Qty) ? "bg-red-300 text-black" : ""}`}
                                        />
                                    </Field>
                                }

                                <Field>
                                    <Input
                                        name="expiry"
                                        defaultValue={item['Exp.']}
                                        disabled
                                        className={`${(item.old_expiry !== null) && (item['Exp.'] !== item.old_expiry) ? "bg-red-300 text-black" : ""}`}
                                    />
                                </Field>

                                <Field>
                                    <Input
                                        name="expiry"
                                        defaultValue={item.old_expiry}
                                        disabled
                                        className={`${(item.old_expiry !== null) && (item['Exp.'] !== item.old_expiry) ? "bg-red-300 text-black" : ""}`}
                                    />
                                </Field>
                            </div>

                        ))}

                        <Field className='flex mt-4'>
                            {discrepancy &&
                                <p className='text-sm'>
                                    Discrepancy Status: {discrepancy ? "Yes" : "No"}
                                </p>
                            }
                        </Field>

                    </FieldGroup>


                    <FieldGroup className='md:hidden' >

                        {items?.map((item, index) => (

                            <div key={item.id}>
                                <span>Item {index + 1}</span>
                                <div className={`grid grid-cols-[20%_80%] space-y-2 mb-0 border rounded-lg p-2`}>

                                    <Label>Batch No.</Label>
                                    <Field>
                                        <Input
                                            name="batch"
                                            defaultValue={item['Batch No.']}
                                            className={`${(item.old_batch_no !== null) && (item['Batch No.'] !== item.old_batch_no) ? "bg-red-300 text-black" : ""}`}
                                            disabled
                                        />
                                    </Field>

                                    <Label>Particular</Label>
                                    <Field>
                                        <Input
                                            name="particular"
                                            defaultValue={item.PARTICULARS}
                                            disabled
                                            className=''
                                        />
                                    </Field>

                                    <Label>Current Qty</Label>
                                    <Field>
                                        <Input
                                            name="particular"
                                            defaultValue={item.old_Qty ? item.old_Qty : item.Qty}
                                            disabled
                                        />
                                    </Field>

                                    <><Label>Changed to</Label>
                                        <Field>
                                            <Input
                                                name="qty"
                                                defaultValue={item.Qty}
                                                disabled
                                                className={`${(item.old_Qty !== null) && (item.Qty !== item.old_Qty) ? "bg-red-300 text-black" : ""}`}
                                            />
                                        </Field>
                                    </>

                                    <Label>Expiry</Label>
                                    <Field>
                                        <Input
                                            name="expiry"
                                            defaultValue={item.old_expiry}
                                            disabled
                                            className={`${(item.old_expiry !== null) && (item['Exp.'] !== item.old_expiry) ? "bg-red-300 text-black" : ""}`}
                                        />
                                    </Field>

                                    <Label>Updated Expiry</Label>
                                    <Field>
                                        <Input
                                            name="expiry"
                                            defaultValue={item['Exp.']}
                                            disabled
                                            className={`${(item.old_expiry !== null) && (item['Exp.'] !== item.old_expiry) ? "bg-red-300 text-black" : ""}`}
                                        />
                                    </Field>
                                </div>
                            </div>

                        ))}

                        <Field className='flex mt-4'>
                            {discrepancy &&
                                <p className='text-sm'>
                                    Discrepancy Status: {discrepancy ? "Yes" : "No"}
                                </p>
                            }
                        </Field>

                    </FieldGroup>

                    <DialogFooter className=''>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default DicsrepancyView