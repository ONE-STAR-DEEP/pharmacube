"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRouter, useSearchParams } from "next/navigation";

const Filter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("Vtyp") || "S3";

  // 👇 set default in URL
  useEffect(() => {
    if (!searchParams.get("Vtyp")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("Vtyp", "S3");
      params.set("page", "1");
      router.replace(`?${params.toString()}`);
    }
  }, [searchParams, router]);

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("Vtyp");
    } else {
      params.set("Vtyp", value);
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentFilter} onValueChange={handleChange}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Filter Invoice" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">All Invoice</SelectItem>
          <SelectItem value="S1">S1</SelectItem>
          <SelectItem value="S2">S2</SelectItem>
          <SelectItem value="S3">S3</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default Filter;