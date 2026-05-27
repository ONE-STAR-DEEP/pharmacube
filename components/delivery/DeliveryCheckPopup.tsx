"use client"

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

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchInvoiceByVNo, fetchInvoiceItems } from '@/lib/actions/invoice'
import { BillItem, Invoice } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check } from 'lucide-react'
import { updateDelivery } from '@/lib/actions/delivery'
import imageCompression from "browser-image-compression";
import { Textarea } from '../ui/textarea'

const MAX_SIZE_MB = 1;

const processImage = async (file: File) => {
  if (file.size / (1024 * 1024) <= MAX_SIZE_MB) {
    return new File(
      [file],
      file.name.replace(/\.[^/.]+$/, "") + ".webp",
      {
        type: "image/webp",
      }
    );
  }

  const compressedFile = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  });

  return new File(
    [compressedFile],
    file.name.replace(/\.[^/.]+$/, "") + ".webp",
    {
      type: "image/webp",
      lastModified: Date.now(),
    }
  );
};

const DeliveryCheckPopup = ({ VNo, Vtyp }: { VNo: string; Vtyp: string }) => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)
  const router = useRouter()

  const [isDiscrepancy, setIsDiscrepancy] = useState(
    Number(invoice?.discrepancy) === 1 ? true : false
  );

  useEffect(() => {
    setIsDiscrepancy(
      Number(invoice?.discrepancy) === 1 ? true : false
    );
  }, [invoice]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgLoading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setImgLoading(false)
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed (jpg, png, webp, etc.)");
      setImgLoading(false)
      return;
    }

    const compressedImg = await processImage(file)
    setImage(compressedImg);
    setImgLoading(false)
  };

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      try {
        const res = await fetchInvoiceItems(VNo, Vtyp);
        const invRes = await fetchInvoiceByVNo(VNo, Vtyp);
        if (!res.success && !invRes.success) {
          alert("Failed to fetch data Try Again");
          setOpen(false);
          return;
        }
        setData(res.data || [])
        setInvoice(invRes.data || null);

      } catch (error) {
        console.log(error);
      }
    }
    loadData();
  }, [open]);

  const currentStatus = Number(invoice?.status)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (loading) return;
    setLoading(true);

    try {
      if (!invoice) {
        return;
      }

      const res = await updateDelivery(remark, invoice?.id, isDiscrepancy, image, data!);

      if (!res.success) {
        alert("Failed to update delivery details. Try Again");
        return;
      }

      setOpen(false)
      router.refresh();
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
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
                Review and update any mismatches in invoice details before final submission.
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
                        disabled={imgLoading}
                      >
                        {image ?
                          <>
                            <Check /> Selected
                          </>
                          :
                          <>
                            <Camera /> {imgLoading ? "Wait..." : "Recipt"}
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

            <FieldGroup className='overflow-y-auto'>

              <div className="grid grid-cols-[40px_150px_1fr_100px_150px] gap-4 mb-0">
                <Label>SNo</Label>
                <Label>Batch No.</Label>
                <Label className='min-w-60'>Particular</Label>
                <Label>Quantity</Label>
                <Label>Expiry</Label>
              </div>

              {data?.map((item, index) => {

                return (

                  <div key={item.id} className="grid grid-cols-[40px_150px_1fr_100px_150px] gap-4 mb-0">

                    <Input
                      name="sno"
                      defaultValue={index + 1}
                      disabled
                    />

                    <Field>
                      <Input
                        name="batch"
                        value={item?.['Batch No.'] || ""}
                        disabled
                      />
                    </Field>

                    <Field className='min-w-60'>
                      <Input
                        name="particular"
                        defaultValue={item.PARTICULARS}
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
                        name="expiry"
                        value={item?.['Exp.'] || ""}
                        disabled
                      />
                    </Field>
                  </div>
                )
              })}


            </FieldGroup>

            <div className='space-y-4'>
              <Field>
                <FieldLabel>Remark</FieldLabel>
                <Textarea onChange={(e) => setRemark(e.target.value)} placeholder='Any Issue?' disabled={!!invoice?.remark} value={invoice?.remark || remark}></Textarea>
              </Field>

              <Field>
                <FieldLabel>Discrepancy</FieldLabel>
                <RadioGroup
                  value={isDiscrepancy ? "yes" : "no"}
                  onValueChange={(value) => { setIsDiscrepancy(value === "yes") }}
                  className="w-fit"
                  disabled={Number(invoice?.status) !== 6}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="no" id="r1" />
                    <Label htmlFor="r1">No</Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="yes" id="r2" />
                    <Label htmlFor="r2">Yes</Label>
                  </div>
                </RadioGroup>
              </Field>
            </div>

            <DialogFooter className=''>
              <DialogClose asChild>
                <Button variant="outline" type='button'>Close</Button>
              </DialogClose>
              {Number(invoice?.status) === 6 && (
                <Button type="submit" disabled={loading}>Submit</Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default DeliveryCheckPopup