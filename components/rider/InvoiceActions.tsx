"use client"

import { cancelRequest, riderAction } from '@/lib/actions/rider';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react'
import { Button } from '../ui/button';
import { Loader } from 'lucide-react';

type LocationCoords = {
  lat: number;
  lng: number;
  accuracy: number; // meters
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

const InvoiceActions = ({ id, action }: {
  id: number;
  action: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (loading) return;
    setCancelLoading(true);
    try {
      const res = await cancelRequest(id);
      if (!res.success) {
        alert(res.message);
        return;
      }
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setCancelLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {

    if (loading) return;
    e.preventDefault()

    setLoading(true)
    try {
      const location = await getCurrentLocation();
      const lat = location.lat
      const lng = location.lng
      const accuracy = location.accuracy
      const res = await riderAction({ id, lat, lng, accuracy, action });

      if (!res.success) {
        alert(res.message || "Action failed, Try Again");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to get location");
    } finally {
      setLoading(false)
    }
    router.refresh();
  }

  if (action === "accepted") {
    return (
      <Button className="m-0 px-2 w-15" onClick={handleSubmit} disabled={loading}>
        {loading ? <Loader /> : "Accept"}
      </Button>
    )
  }
  else if (action === "picked") {
    return (
      <>
        <Button className="m-0 px-2 w-15" onClick={handleCancel} disabled={cancelLoading}>
          {cancelLoading ? <Loader /> : "Cancel"}
        </Button>

        <Button className="m-0 px-2 w-15" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader /> : "Pick up"}
        </Button>
      </>
    )
  }
  else if (action === "delivered") {
    return (
      <Button className="m-0 px-2 w-15" onClick={handleSubmit} disabled={loading}>
        {loading ? <Loader /> : "Deliver"}
      </Button>
    )
  }
}

export default InvoiceActions