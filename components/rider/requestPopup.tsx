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
import { BillItem, DeliveryBoy, Invoice } from '@/utils/types/DataTypes'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchDeliveryBoy, riderAction } from '@/lib/actions/rider'

type SelectOption = {
  label: string;
  value: string;
};

export type LocationCoords = {
  lat: number;
  lng: number;
  accuracy: number; // meters
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

      const res = await riderAction({ VNo, lat, lng, accuracy, action: 'accept' })
      if (!res.success) {
        alert("Failed")
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
      <Button onClick={() => { setOpen(true) }}>Accept</Button>

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
              <Button type="submit" disabled={loading}>{loading ? "Wait..." : "Accept"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default RequestPopup