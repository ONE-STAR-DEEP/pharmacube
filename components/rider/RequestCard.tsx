"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import InvoiceActions from "./InvoiceActions"
import { InvoiceData } from "@/utils/types/DataTypes"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { riderAcceptMultiple } from "@/lib/actions/rider";
import { Button } from "../ui/button";

type LocationCoords = {
  lat: number;
  lng: number;
  accuracy: number;
};

const getCurrentLocation = (): Promise<LocationCoords> => {
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

const RequestCard = ({ data, action }: { data: InvoiceData[]; action: string }) => {

  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState((false))
  const router = useRouter();

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const location = await getCurrentLocation();
      const lat = location.lat
      const lng = location.lng
      const accuracy = location.accuracy
      const res = await riderAcceptMultiple({ ids: selected, lat, lng, accuracy, action: action })
      if (!res.success) {
        alert(res.message)
        return
      }
      setSelected([])
      router.refresh()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {data.map((invoice) => (
        <Accordion
          key={invoice.id}
          type="single"
          collapsible
          className={`${Boolean(invoice.urgent) && "bg-red-100"}`}

        >
          <AccordionItem value={`item-${invoice.id}`}>
            <div className="flex">
              <input
                type="checkbox"
                className="ml-2"
                checked={selected.includes(invoice.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelected((prev) => [...prev, invoice.id]);
                  } else {
                    setSelected((prev) => prev.filter((id) => id !== invoice.id));
                  }
                }}
              />
              <AccordionTrigger className="flex w-[80vw]">
                <span className={`font-bold ${Boolean(invoice.urgent) && "text-red-600"}`}>{invoice.GSTVno}</span>
                <span className="font-light">{new Date(invoice.Vdt).toLocaleDateString("en-GB")} - {invoice.mTime}</span>
              </AccordionTrigger>
            </div>


            <AccordionContent>
              <p>{invoice.partyName}</p>

              <div className="grid grid-cols-[40%_60%]">
                <span>No. of Items</span>
                <span>: {invoice.NoOfItem}</span>

                <span>Discrepancy</span>
                <span>: {Boolean(invoice.discrepancy) ? "Yes" : "No"}</span>

                <span>Amount</span>
                <span>: {invoice["InvAmt"]}</span>
              </div>

              <div className="flex items-center justify-end">
                <InvoiceActions
                  id={invoice.id}
                  action={action}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}

      {selected.length > 0
        &&
        <Button
          disabled={loading}
          onClick={() => handleClick()}
          className="
                fixed
                bottom-6
                left-1/2
                -translate-x-1/2
                z-50
                rounded-full
                bg-primary
                p-6
                text-white
                text-base
                shadow-lg
                hover:bg-primary/70
                transition-colors
                "
        >
          {action === "accepted" && "Accept Selected"}
          {action === "picked" && "Pick Selected"}
          {action === "delivered" && "Deliver Selected"}
        </Button>
      }
    </>
  );
};

export default RequestCard;