"use client";

import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );

      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white p-4 shadow-sm border-b flex items-center justify-between">
      {/* Left Side */}
      <div>
        <h1 className="text-xl font-semibold">
          Pharma Cube Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Manage all invoice insights
        </p>
      </div>

      {/* Right Side */}
      <div className="text-right">
        <p className="text-sm font-medium">{date}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </header>
  );
}