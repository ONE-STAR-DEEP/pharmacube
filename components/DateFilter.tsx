"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

export default function DateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!startDate || !endDate) return;

        const params = new URLSearchParams(searchParams.toString());

        params.set("startDate", format(startDate, "yyyy-MM-dd"));
        params.set("endDate", format(endDate, "yyyy-MM-dd"));
        params.set("page", format("page", "1"));

        setOpen(false)

        router.push(`?${params.toString()}`);
    }, [startDate, endDate]);

    const handleReset = () => {
        setStartDate(undefined);
        setEndDate(undefined);

        const params = new URLSearchParams(searchParams.toString());

        params.delete("startDate");
        params.delete("endDate");

        router.push(`?${params.toString()}`);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-30">
                    <Filter className="mr-2 h-4 w-4" />
                    Date Filter
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[90vw] md:w-100 p-4" align="end">
                <div className="space-y-4">
                    <h4 className="font-medium">Filter by Date</h4>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-2 block text-sm">
                                Start Date
                            </label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        {startDate
                                            ? format(startDate, "dd/MM/yyyy")
                                            : "Select"}

                                        <CalendarIcon className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        captionLayout="dropdown"
                                        startMonth={new Date(2026, 0)}
                                        endMonth={new Date(2045, 11)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm">
                                End Date
                            </label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        {endDate
                                            ? format(endDate, "dd/MM/yyyy")
                                            : "Select"}

                                        <CalendarIcon className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        captionLayout="dropdown"
                                        startMonth={new Date(2026, 0)}
                                        endMonth={new Date(2045, 11)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleReset}
                    >
                        Reset Filters
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}