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
import { fetchInvoiceByVNo, fetchInvoiceItems, updateInvoiceItems } from '@/lib/actions/invoice'
import { BillItem, Invoice } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const ItemUpdatePopup = ({ VNo, Vtyp }: { VNo: string; Vtyp: string }) => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<BillItem[] | null>(null);
  const [originalData, setOriginalData] = useState<BillItem[]>([]);
  const [discrepancy, setDiscrepancy] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      setInvoice(null);
      setData(null);
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

    setDiscrepancy(isDifferent);
  }, [formData]);

  const handleChange = async (e: FormEvent) => {
    e.preventDefault()

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

    if (!invoice?.id) {
      return
    }
    const res = await updateInvoiceItems(cleanedData, invoice?.id, VNo, Vtyp, discrepancy)

    if (!res.success) {
      alert("Failed")
    }
    setOpen(false)
    router.refresh();
  }

  return (
    <div>
      <Button onClick={() => { setOpen(true) }}>Acknowledge</Button>

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
          <form className='space-y-4' onSubmit={handleChange}>
            <DialogHeader>
              <DialogTitle className='text-2xl'>Discrepency Check</DialogTitle>
              <DialogDescription>
                Review and update any mismatches in invoice details such as Quantity, Batch No or Expiry before final submission.
              </DialogDescription>
              <h1 className='text-lg font-semibold mt-2'>Invoice No: <span className='text-orange-600'>{invoice?.['Bill No']}</span></h1>
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
                        placeholder={current?.['Batch No.'] || "Batch No"}

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
                        type='number'

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
                        placeholder={current?.["Exp."] || ""}

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
                          let value = e.target.value;

                          // Remove non-digits
                          value = value.replace(/\D/g, "");

                          // Max 4 digits
                          value = value.slice(0, 4);

                          if (value.length >= 2) {
                            let month = Number(value.slice(0, 2));

                            // Prevent month > 12
                            if (month > 12) {
                              value = "12" + value.slice(2);
                            }

                            // Prevent 00 month
                            if (month === 0) {
                              value = "01" + value.slice(2);
                            }
                          }

                          // Format MM/YY
                          if (value.length >= 3) {
                            value = `${value.slice(0, 2)}/${value.slice(2)}`;
                          }

                          // Update visible input manually
                          e.target.value = value;

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
                        }
                        }
                      />
                    </Field>
                  </div>
                )
              })
              }
            </FieldGroup>

            <DialogFooter className='mt-10'>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default ItemUpdatePopup