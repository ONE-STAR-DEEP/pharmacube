import { Button } from '../ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchInvoiceByVNo, fetchInvoiceItems } from '@/lib/actions/invoice'
import { BillItem, Invoice } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { riderAction } from '@/lib/actions/rider'

export type LocationCoords = {
  lat: number;
  lng: number;
  accuracy: number; // meters
};

const status = {
  4: "Accepted",
  5: "Out for Delivery",
  6: "Delivered To Client",
  7: "Delivery Failed",
  8: "Discrepancy Reported",
  9: "Discrepancy Resolved",
};

const button = {
  3: "Accept",
  4: "Confirm Pickup",
  5: "Deliver",
  6: "Delivered",
};

const action = {
  3: "accepted",
  4: "picked",
  5: "delivered",
  6: "delivered",
};

export const getCurrentLocation = (): Promise<LocationCoords> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

const RequestPopup = ({ VNo }: { VNo: string }) => {

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BillItem[] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLloading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      try {
        const res = await fetchInvoiceItems(VNo);
        const invRes = await fetchInvoiceByVNo(VNo);
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

    if (loading) return;
    e.preventDefault()

    setLloading(true)

    try {
      const location = await getCurrentLocation();

      const lat = location.lat
      const lng = location.lng
      const accuracy = location.accuracy

      if(!invoice?.id){
        alert("Invoice not found")
        return;
      }
      const res = await riderAction({ id: invoice?.id, lat, lng, accuracy, action: action[(invoice?.status || 4) as keyof typeof action] });
      if (!res.success) {
        alert(res.message || "Action failed, Try Again");
      }

    } catch (error) {
      console.error(error);
      alert("Failed to get location");
    } finally {
      setLloading(false)
    }


    setOpen(false)
    router.refresh();
  }

  return (
    <div>
      <Button onClick={() => { setOpen(true) }}>Action</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-full
                    max-w-[90vw]
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
              <DialogTitle className='text-2xl'>Request Window</DialogTitle>
              <h1 className='text-lg font-semibold mt-2'>Invoice No: <span className='text-orange-600'>{invoice?.['Bill No']}</span></h1>
            </DialogHeader>

            <div className='grid grid-cols-[20%_5%_75%]'>

              <p>Tel</p>
              <p>:</p>
              <p>{invoice?.Tel}</p>

              <p>Address:</p>
              <p>:</p>
              <p>{invoice?.address}</p>

              <p>Status:</p>
              <p>:</p>
              <p>{status[(invoice?.status || 4) as keyof typeof status]}</p>

            </div>

            <p className='font-semibold text-base'>Order Items</p>

            <FieldGroup >
              <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-4 mb-0">
                <Label>SNo</Label>
                <Label>HSN</Label>
                <Label>Particular</Label>
                <Label>Qty</Label>
              </div>

              {data?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[40px_1fr_1fr_1fr] gap-4 mb-0">

                  <Input
                    name="sno"
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
                      name="originalQty"
                      defaultValue={item.old_Qty ? item.old_Qty : "Unaltered"}
                      disabled
                    />
                  </Field>

                </div>
              ))}

            </FieldGroup>
            <DialogFooter className=''>
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
              
              <Button type="submit" disabled={loading || Number(invoice?.status) === 6}>{loading ? "Wait..." : button[(invoice?.status || 4) as keyof typeof button]}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default RequestPopup