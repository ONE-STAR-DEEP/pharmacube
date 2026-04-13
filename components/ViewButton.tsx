"use client"

import Link from "next/link"
import { Button } from "./ui/button"

export const ViewButton = ({ billNo }: { billNo: string }) => {
  return (
    <Button asChild size="sm">
      <Link href={`/allBills/invoice/${billNo}`}>
        View
      </Link>
    </Button>
  )
}