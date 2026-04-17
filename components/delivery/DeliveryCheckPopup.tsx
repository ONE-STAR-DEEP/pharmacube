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

import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchInvoiceByVNo, fetchInvoiceItems } from '@/lib/actions/invoice'
import { BillItem, Invoice } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check } from 'lucide-react'
import { updateDelivery } from '@/lib/actions/delivery'

const DeliveryCheckPopup = ({ VNo }: { VNo: string }) => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<BillItem[] | null>(null);
  const [discrepancy, setDiscrepancy] = useState(false);
  const router = useRouter()

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

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
      } catch (error) {
        console.log(error);
      }
    }
    loadData();
  }, [open]);

  const currentStatus = Number(invoice?.status)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const imageData = new FormData();

    // append image ONLY if exists
    if (image) {
      imageData.append("receipt", image);
    }
    if (!invoice) {
      return
    }
    const res = await updateDelivery(formData || [], invoice?.id, discrepancy, image);

    if (!res.success) {
      alert("Failed to update delivery details. Try Again");
      return;
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
          <form className='space-y-4' onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className='text-2xl'>{currentStatus !== 6 ? "Delivery Record" : "Delivery Check"}</DialogTitle>
              <DialogDescription>
                Review and update any mismatches in invoice details such as quantity or HSN code before final submission.
              </DialogDescription>
              <div className='flex items-center justify-between'>
                <h1 className='text-lg font-semibold mt-2'>Invoice No: <span className='text-orange-600'>{invoice?.['Bill No']}</span></h1>
                <div className="flex flex-col gap-4">
                  {/* Hidden input */}
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleChange}
                    className="hidden"
                  />

                  {/* Button */}
                  {
                    currentStatus === 6 ?
                      <Button
                        type='button'
                        onClick={handleClick}
                      >
                        {image ?
                          <>
                            <Check /> Selected
                          </>
                          :
                          <>
                            <Camera /> Recipt
                          </>
                        }
                      </Button>
                      :
                      <Button
                        onClick={() => window.open(`/receipts${invoice?.recipt}`, "_blank")}
                        type='button'
                      >
                        View Receipt
                      </Button>
                  }
                </div>
              </div>
            </DialogHeader>

            <FieldGroup >
              <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-2 mb-0">
                <Label>SNo</Label>
                <Label>HSN</Label>
                <Label>Particular</Label>
                <Label>Original Qty</Label>
                <Label>Current Qty</Label>
              </div>

              {data?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-2 mb-0">

                  <Input
                    name="hsn"
                    defaultValue={index + 1}
                    disabled
                  />
                  <Field>
                    <Input
                      name="hsn"
                      defaultValue={item["HSN CODE"]}
                      disabled
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
                      defaultValue={item.old_Qty ? item.old_Qty : item.Qty}
                      disabled
                    />
                  </Field>

                  <Field>
                    <Input
                      name="qty"
                      defaultValue={item.Qty}
                      disabled={currentStatus !== 6}
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

            </FieldGroup>
            <DialogFooter className=''>
              <DialogClose asChild>
                <Button variant="outline" type='button'>Close</Button>
              </DialogClose>
              {Number(invoice?.status) === 6 && (
                <Button type="submit">Submit</Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default DeliveryCheckPopup