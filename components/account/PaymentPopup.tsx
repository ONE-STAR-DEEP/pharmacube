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
import { fetchInvoiceByVNo, fetchInvoiceItems } from '@/lib/actions/invoice'
import { BillItem, Invoice, PaymentData } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePayment } from '@/lib/actions/account'

const PaymentPopup = ({ VNo, Vtyp }: { VNo: string; Vtyp: string }) => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: null,
    remark: "",
    mode: ""
  })

  const router = useRouter()

  const paymentModes = [
    "Cash",
    "Cheque",
    "Others",
  ];

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (loading) return;
    setLoading(true);

    try {

      if (!invoice) {
        return;
      }
      const res = await updatePayment(paymentData, invoice['GST No.'], invoice?.id);

      if (!res.success) {
        alert(res.message);
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
                    p-8
                    overflow-y-auto
                    "
        >
          <form className='space-y-4' onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className='text-2xl font-semibold'>Payment</DialogTitle>
              <DialogDescription>
                Select payment mode and amount
              </DialogDescription>
              <div className='flex items-center justify-between'>
                <h1 className='text-lg font-semibold mt-2'>Invoice No: <span className='text-orange-600'>{invoice?.['Bill No']}</span></h1>
              </div>
            </DialogHeader>

            <FieldGroup >
              <div className="grid grid-cols-[40px_100px_1fr_100px] gap-2 mb-0">
                <Label>SNo</Label>
                <Label>HSN</Label>
                <Label>Particular</Label>
                <Label>Qty</Label>
              </div>

              {data?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[40px_100px_1fr_100px] gap-2 mb-0">

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
                      name="qty"
                      defaultValue={item.Qty}
                      disabled
                    />
                  </Field>
                </div>
              ))}

              <div className='mt-8'>

                <h2 className='text-lg font-semibold mb-4'>Payment Details</h2>
                <FieldGroup className='grid grid-cols-1 md:grid-cols-[30%_70%] '>

                  <Field className="space-y-2">
                    <FieldLabel>Amount</FieldLabel>

                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter amount"
                      value={paymentData.amount ?? ""}
                      className="h-8"
                      required
                      onChange={(e) => {
                        const value =
                          Number(e.target.value) <= 0
                            ? 0
                            : Number(e.target.value);

                        setPaymentData((prev) => ({
                          ...prev,
                          amount: value,
                        }));
                      }}
                    />
                  </Field>

                  <Field className="space-y-2">
                    <FieldLabel>Remark</FieldLabel>

                    <Input
                      placeholder="Enter remark"
                      className="h-8"
                      onChange={(e) => {
                        setPaymentData((prev) => ({
                          ...prev,
                          remark: e.target.value
                        }))
                      }}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Mode of Payment</FieldLabel>

                    <Select onValueChange={(value) => {
                      setPaymentData((prev) => ({
                        ...prev,
                        mode: value
                      }))
                    }}
                      required
                    >
                      <SelectTrigger className="w-full h-8">
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Payment Modes</SelectLabel>

                          {paymentModes.map((mode) => (
                            <SelectItem
                              key={mode}
                              value={mode}
                              className="h-6"
                            >
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                </FieldGroup>
              </div>

            </FieldGroup>
            <DialogFooter className=''>
              <DialogClose asChild>
                <Button variant="outline" type='button'>Close</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default PaymentPopup