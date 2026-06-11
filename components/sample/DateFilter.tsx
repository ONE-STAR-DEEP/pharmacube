"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function DateFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentDate = searchParams.get("date");

    const [date, setDate] = React.useState<Date | undefined>(
        currentDate ? new Date(currentDate) : undefined
    );

    const updateUrl = (selectedDate?: Date) => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedDate) {
            params.set("date", format(selectedDate, "yyyy-MM-dd"));
        } else {
            params.delete("date");
        }

        router.push(
            params.toString()
                ? `${pathname}?${params.toString()}`
                : pathname,
            {
                scroll: false,
            }
        );
    };

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        updateUrl(selectedDate);
    };

    const handleClear = () => {
        setDate(undefined);
        updateUrl();
    };

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd MMM yyyy") : "Select Date"}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        startMonth={new Date(2026, 0)}
                        endMonth={new Date(2045, 11)}
                    />
                </PopoverContent>
            </Popover>

            {date && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleClear}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}