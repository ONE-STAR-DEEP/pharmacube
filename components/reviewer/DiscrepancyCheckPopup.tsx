import { Button } from '../ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { discrepancyAction, fetchInvoiceByVNo, fetchInvoiceItems, updateInvoiceItems } from '@/lib/actions/invoice'
import { BillItem, Invoice } from '@/utils/types/DataTypes'
import { act, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const DiscrepancyCheckPopup = ({ VNo }: { VNo: string }) => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<BillItem[] | null>(null);
  const [discrepancy, setDiscrepancy] = useState(false);
  const [action, setAction] = useState("");
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      try {
        setDiscrepancy(false)
        const res = await fetchInvoiceItems(VNo);
        const invRes = await fetchInvoiceByVNo(VNo);
        if (!res.success && !invRes.success) {
          alert("Failed to fetch data Try Again");
          setOpen(false);
          return;
        }
        setData(res.data || [])
        setInvoice(invRes.data || null);
        setFormData(res.data || [])
        console.log(invRes?.data)
        setDiscrepancy(Boolean(invRes?.data?.discrepancy))
      } catch (error) {
        console.log(error);
      }
    }
    loadData();
  }, [open]);

  const handleChange = async (e: FormEvent) => {
    e.preventDefault()

    const res = await discrepancyAction(formData || [], discrepancy, action, VNo)

    if (!res.success) {
      alert("Failed")
    }
    setOpen(false)
    router.refresh();
  }

  return (
    <div>
      <Button onClick={() => { setOpen(true) }}>Check</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-full
                    max-w-[95vw]
                    sm:max-w-md
                    lg:max-w-[60vw]
                    min-h-[20vh]
                    max-h-[80vh] 
                    flex flex-col
                    p-4
                    overflow-y-auto
                    "
        >
          <form className='space-y-4' onSubmit={handleChange}>
            <DialogHeader>
              <DialogTitle className='text-2xl'>Discrepency Window</DialogTitle>
              <DialogDescription>
                Review and update any mismatches in invoice details such as quantity or HSN code before final submission.
              </DialogDescription>
              <h1 className='text-lg font-semibold mt-2'>Invoice No: <span className='text-orange-600'>{invoice?.['Bill No']}</span></h1>
            </DialogHeader>

            <FieldGroup >
              <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr] gap-4 mb-0">
                <Label>SNo</Label>
                <Label>HSN</Label>
                <Label>Particular</Label>
                <Label>Original Qty</Label>
                <Label>Current Qty</Label>
                <Label>Change to</Label>
              </div>

              {data?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr] gap-4 mb-0">

                  <Input
                    name="hsn"
                    defaultValue={index + 1}
                    disabled
                  />
                  <Field>
                    <Input
                      name="hsn"
                      defaultValue={item["HSN CODE"]}
                      onChange={(e) => {
                        const value = e.target.value;

                        setDiscrepancy(true);

                        setFormData((prev) => {
                          if (!prev) return prev;

                          return prev.map((billItem) =>
                            billItem.id === item.id
                              ? { ...billItem, "HSN CODE": value }
                              : billItem
                          );
                        });
                      }}
                    />
                  </Field>

                  <Field>
                    <Input
                      name="particular"
                      defaultValue={item.PARTICULARS}
                      disabled
                    />
                  </Field>

                  <Field>
                    <Input
                      name="particular"
                      defaultValue={item.old_Qty ? item.old_Qty : "Unaltered"}
                      disabled
                    />
                  </Field>

                  <Field>
                    <Input
                      name="qty"
                      defaultValue={item.Qty}
                      disabled
                    />
                  </Field>

                  <Field>
                    <Input
                      name="change"
                      placeholder={String(item.Qty)}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        setDiscrepancy(true);

                        setFormData((prev) => {
                          if (!prev) return prev;

                          return prev.map((billItem) =>
                            billItem.id === item.id
                              ? { ...billItem, Qty: value }
                              : billItem
                          );
                        });
                      }}
                    />
                  </Field>
                </div>
              ))}

              <Field className='flex mt-4'>
                <p className='text-sm'>
                  Discrepancy Status: {discrepancy ? "Yes" : "No"}
                </p>
              </Field>

              <Field className='flex flex-row mt-4 items-center'>
                <p className='max-w-10'>Action:</p>
                <Select
                  onValueChange={(value)=>{
                    setAction(value);
                  }}
                >
                  <SelectTrigger className="w-full max-w-48">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Action</SelectLabel>
                      <SelectItem value="reject">Reject</SelectItem>
                      <SelectItem value="accept">Accept for Delivery</SelectItem>
                      <SelectItem value="approvedWithDiscrepancy">Approve with Discrepancy</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

            </FieldGroup>
            <DialogFooter className=''>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default DiscrepancyCheckPopup