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
import { discrepancyAction, fetchInvoiceByVNo, fetchInvoiceItems, updateInvoiceItems } from '@/lib/actions/invoice'
import { BillItem, DeliveryBoy, Invoice } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchDeliveryBoy, approveForDelivery } from '@/lib/actions/rider'

type SelectOption = {
  label: string;
  value: string;
};

const mapUsersToOptions = (users: DeliveryBoy[]): SelectOption[] => {
  return users.map((user) => ({
    label: `${user.name} (${user.email})`,
    value: user.id.toString(),
  }));
};

const DiscrepancyCheckPopup = ({ VNo, Vtyp }: { VNo: string; Vtyp: string }) => {

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<BillItem[] | null>(null);
  const [discrepancy, setDiscrepancy] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      setInvoice(null);
      setData(null);
      try {
        setDiscrepancy(false)
        const res = await fetchInvoiceItems(VNo, Vtyp);
        const invRes = await fetchInvoiceByVNo(VNo, Vtyp);
        
        if (!res.success && !invRes.success) {
          alert("Failed to fetch data Try Again");
          setOpen(false);
          return;
        }
        setData(res.data || [])
        setInvoice(invRes.data || null);
        setFormData(res.data || [])
        setDiscrepancy((invRes?.data?.discrepancy === 1))
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
      if (discrepancy) {
        const res = await discrepancyAction(formData || [], VNo, Vtyp)
        if (!res.success) {
          alert("Failed")
        }
      }
      else {
        const res = await approveForDelivery(VNo, Vtyp)

        if (!res.success) {
          alert("Failed")
        }
      }
      setOpen(false)
      setLoading(false);
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

  }

  return (
    <div>
      <Button onClick={() => { setOpen(true) }}>Actions</Button>

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
          <form className='space-y-4' onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className='text-2xl'>{invoice?.discrepancy ? "Discrepency Check" : "Approve Invoice"}</DialogTitle>
              <DialogDescription>
                Review any mismatches in invoice details such as quantity, Expiry or Batch No before final submission.
              </DialogDescription>
              <h1 className='text-lg font-semibold mt-2'>Invoice No: <span className='text-orange-600'>{invoice?.['Bill No']}</span></h1>
            </DialogHeader>

            <FieldGroup >
              <div className={`grid ${invoice?.discrepancy===1 ? "grid-cols-[40px_150px_1fr_100px_100px_150px]" : "grid-cols-[40px_150px_1fr_100px_150px]"}  gap-4 mb-0`}>
                <Label>SNo</Label>
                <Label>Batch No.</Label>
                <Label className='min-w-60'>Particular</Label>
                <Label>Current Qty</Label>
                {invoice?.discrepancy === 1 &&
                  <Label>Changed to</Label>}
                <Label>Expiry</Label>
              </div>

              {data?.map((item, index) => (
                <div key={item.id} className={`grid ${invoice?.discrepancy===1 ? "grid-cols-[40px_150px_1fr_100px_100px_150px]" : "grid-cols-[40px_150px_1fr_100px_150px]"}  gap-4 mb-0`}>

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

                  {invoice?.discrepancy === 1 &&
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
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              {Number(invoice?.discrepancy) === 1 ? (
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Request New Invoice"}
                </Button>
              ) :
                <Button type="submit" disabled={loading}>
                  {loading ? "Approving..." : "Approve"}
                </Button>
              }
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default DiscrepancyCheckPopup