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

import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchInvoiceByVNo, fetchInvoiceItems } from '@/lib/actions/invoice'
import { BillItem, Invoice } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check } from 'lucide-react'
import { updateDelivery } from '@/lib/actions/delivery'
import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 1.5;

const processImage = async (file: File) => {
  // If already small, send as-is
  if (file.size / (1024 * 1024) <= MAX_SIZE_MB) {
    return file;
  }

  const compressedFile = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: 1920, // optional safety resize
    useWebWorker: true,
  });

  return compressedFile;
};

const DeliveryCheckPopup = ({ VNo, Vtyp }: { VNo: string; Vtyp: string }) => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<BillItem[] | null>(null);
  const [originalData, setOriginalData] = useState<BillItem[]>([]);
  const [isDiscrepancy, setIsDiscrepancy] = useState(false);
  const [loading, setLoading] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)
  const router = useRouter()

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
        setIsDiscrepancy(false)
        const res = await fetchInvoiceItems(VNo, Vtyp);
        const invRes = await fetchInvoiceByVNo(VNo, Vtyp);
        if (!res.success && !invRes.success) {
          alert("Failed to fetch data Try Again");
          setOpen(false);
          return;
        }
        setData(res.data || [])
        setInvoice(invRes.data || null);
        setOriginalData(res.data || []);
        setFormData(res.data || [])
      } catch (error) {
        console.log(error);
      }
    }
    loadData();
  }, [open]);

  useEffect(() => {
    if (!formData || !originalData) return;

    const isDifferent = formData.some((item, i) => {
      const original = originalData[i];
      return (
        item.Qty !== original.Qty ||
        item["Batch No."] !== original["Batch No."] ||
        item['Exp.'] !== original['Exp.']
      );
    });

    setIsDiscrepancy(isDifferent);
  }, [formData]);

  const currentStatus = Number(invoice?.status)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (loading) return;
    setLoading(true);

    const cleanedData = (formData || []).map((item, i) => {
      const original = originalData[i];

      return {
        ...item,
        "Batch No.":
          item['Batch No.'] === "" ? original['Batch No.'] : item['Batch No.'],
        "Exp.":
          item['Exp.'] === "" ? original['Exp.'] : item['Exp.'],
        Qty:
          item.Qty === "" ? original.Qty : item.Qty
      };
    });

    try {
      const imageData = new FormData();

      if (image) {
        imageData.append("receipt", image);
      }
      if (!invoice) {
        return;
      }
      const res = await updateDelivery(cleanedData || [], invoice?.id, isDiscrepancy, image);

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
              <div className="grid grid-cols-[40px_150px_1fr_100px_100px_150px] gap-4 mb-0">
                <Label>SNo</Label>
                <Label>Batch No.</Label>
                <Label className='min-w-60'>Particular</Label>
                <Label>Current Qty</Label>
                <Label>Changed to</Label>
                <Label>Expiry</Label>
              </div>

              {data?.map((item, index) => {
                const current = formData?.[index];
                const original = originalData[index];
                return (

                  <div key={item.id} className="grid grid-cols-[40px_150px_1fr_100px_100px_150px] gap-4 mb-0">

                    <Input
                      name="sno"
                      defaultValue={index + 1}
                      disabled
                    />
                    <Field>
                      <Input
                        name="batch"
                        value={current?.['Batch No.'] || ""}

                        onBlur={() => {
                          setFormData((prev) => {
                            if (!prev) return prev;

                            return prev.map((billItem, i) => {
                              if (i !== index) return billItem;

                              return {
                                ...billItem,
                                "Batch No.":
                                  billItem["Batch No."] === ""
                                    ? original["Batch No."]
                                    : billItem["Batch No."]
                              };
                            });
                          });
                        }}

                        onChange={(e) => {
                          const value = e.target.value;

                          setFormData((prev) => {
                            if (!prev) return prev;

                            return prev.map((billItem, i) => {
                              if (i !== index) return billItem;

                              return {
                                ...billItem,
                                "Batch No.": value
                              };
                            });
                          });
                        }}
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
                        name="changed"
                        placeholder={String(item.Qty)}
                        value={current?.Qty ?? ""}

                        onBlur={() => {
                          setFormData((prev) => {
                            if (!prev) return prev;

                            return prev.map((billItem, i) => {
                              if (i !== index) return billItem;

                              return {
                                ...billItem,
                                Qty:
                                  billItem["Qty"] === ""
                                    ? original["Qty"]
                                    : billItem["Qty"]
                              };
                            });
                          });
                        }}

                        onChange={(e) => {
                          const value = e.target.value;

                          setFormData((prev) => {
                            if (!prev) return prev;

                            return prev.map((billItem, i) => {
                              if (i !== index) return billItem;

                              return {
                                ...billItem,
                                Qty: Number(value)
                              };
                            });
                          });
                        }}
                      />
                    </Field>

                    <Field>
                      <Input
                        name="expiry"
                        value={current?.['Exp.'] || ""}

                        onBlur={() => {
                          setFormData((prev) => {
                            if (!prev) return prev;

                            return prev.map((billItem, i) => {
                              if (i !== index) return billItem;

                              return {
                                ...billItem,
                                "Exp.":
                                  billItem["Exp."] === ""
                                    ? original["Exp."]
                                    : billItem["Exp."]
                              };
                            });
                          });
                        }}

                        onChange={(e) => {
                          const value = e.target.value;

                          setFormData((prev) => {
                            if (!prev) return prev;

                            return prev.map((billItem, i) => {
                              if (i !== index) return billItem;

                              return {
                                ...billItem,
                                "Exp.": value
                              };
                            });
                          });
                        }}
                      />
                    </Field>
                  </div>
                )
              })
              }
            </FieldGroup>


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