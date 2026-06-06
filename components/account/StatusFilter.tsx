"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const StatusFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentFilter = searchParams.get("status") || "all";

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === "all") {
            params.delete("status");
        } else {
            params.set("status", value);
        }

        params.set("page", "1");

        router.push(`?${params.toString()}`);
    };

    return (
        <Select value={currentFilter} onValueChange={handleChange}>
            <SelectTrigger className="w-45">
                <SelectValue placeholder="Filter Status" />
            </SelectTrigger>

            <SelectContent>
                <SelectGroup>
                    <SelectItem value="all">All Invoice</SelectItem>
                    <SelectItem value="190">Partial Payment Received</SelectItem>
                    <SelectItem value="200">Payment Received</SelectItem>
                    <SelectItem value="210">Excessive Payment Received</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};

export default StatusFilter;