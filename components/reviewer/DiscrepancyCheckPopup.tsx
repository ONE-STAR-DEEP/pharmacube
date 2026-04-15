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
import { BillItem, DeliveryBoy, Invoice } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchDeliveryBoy, riderSelection } from '@/lib/actions/rider'

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

const DiscrepancyCheckPopup = ({ VNo }: { VNo: string }) => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<BillItem[] | null>(null);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[] | null>(null);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");
  const [discrepancy, setDiscrepancy] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      try {
        setDiscrepancy(false)
        const res = await fetchInvoiceItems(VNo);
        const invRes = await fetchInvoiceByVNo(VNo);
        const deliveryBoysRes = await fetchDeliveryBoy();
        setDeliveryBoys(deliveryBoysRes.data);
        if (!res.success && !invRes.success) {
          alert("Failed to fetch data Try Again");
          setOpen(false);
          return;
        }
        setData(res.data || [])
        setInvoice(invRes.data || null);
        setFormData(res.data || [])
        setDiscrepancy(Boolean(invRes?.data?.discrepancy))
      } catch (error) {
        console.log(error);
      }
    }
    loadData();
  }, [open]);

  const options = mapUsersToOptions(deliveryBoys || []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (discrepancy) {
      const res = await discrepancyAction(formData || [], discrepancy, VNo)
      if (!res.success) {
        alert("Failed")
      }
    }
    else {
      const res = await riderSelection(selectedDeliveryBoy, VNo)

      if (!res.success) {
        alert("Failed")
      }
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
                <DialogTitle className='text-2xl'>{invoice?.discrepancy ? "Discrepency Check" : "Assign Rider" }</DialogTitle>
                <DialogDescription>
                  Review and update any mismatches in invoice details such as quantity or HSN code before final submission.
                </DialogDescription>
                <h1 className='text-lg font-semibold mt-2'>Invoice No: <span className='text-orange-600'>{invoice?.['Bill No']}</span></h1>
              </DialogHeader>

              <FieldGroup >
                <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-4 mb-0">
                  <Label>SNo</Label>
                  <Label>HSN</Label>
                  <Label>Particular</Label>
                  <Label>Original Qty</Label>
                  <Label>Current Qty</Label>
                </div>

                {data?.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-4 mb-0">

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
                        defaultValue={item.old_Qty ? item.old_Qty : "Unaltered"}
                        disabled
                      />
                    </Field>

                    <Field>
                      <Input
                        name="qty"
                        defaultValue={item.Qty}
                        disabled
                        className={`${item.Qty !== item.old_Qty ? "bg-red-300 text-black" : ""}`}
                      />
                    </Field>
                  </div>
                ))}

                <Field className='flex mt-4'>
                  {discrepancy ?
                    <p className='text-sm'>
                      Discrepancy Status: {discrepancy ? "Yes" : "No"}
                    </p>
                    :
                    <div className='flex items-center gap-2'>
                      <p className='max-w-10'>Action:</p>
                      <Select
                        onValueChange={(value) => {
                          setSelectedDeliveryBoy(value);
                        }}
                      >
                        <SelectTrigger className="w-full max-w-48">
                          <SelectValue placeholder="Select Delivery boy" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Delivery Boys</SelectLabel>

                            {options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}

                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  }
                </Field>

              </FieldGroup>
              <DialogFooter className=''>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    )
  }

  export default DiscrepancyCheckPopup