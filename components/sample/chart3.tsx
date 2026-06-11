"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DashboardStats } from "@/utils/types/DataTypes"

export const description = "A multiple bar chart"

// const chartData = [
//   { user: "Warehouse", total: 186, pending: 80, attended: 106 },
//   { user: "Checker", total: 305, pending: 200, attended: 105 },
//   { user: "Reviwer", total: 237, pending: 120, attended: 117 },
//   { user: "Rider", total: 73, pending: 190, attended: 83 },
//   { user: "Delivery", total: 209, pending: 130, attended: 79 },
// ]

const chartConfig = {
  total: {
    label: "total",
    color: "var(--chart-1)",
  },
  pending: {
    label: "pending",
    color: "var(--chart-2)",
  },
  attended: {
    label: "attended",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartBarMultiple({ data }: { data: DashboardStats }) {

  const chartData = Object.values(data).map((item) => ({
    user: item.user.charAt(0).toUpperCase() + item.user.slice(1),
    total: item.total,
    pending: item.pending,
    attended: item.attended,
  }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
        <CardDescription>Processing activity and completion status for selected date or current date.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="user"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={8} />
            <Bar dataKey="pending" fill="var(--color-pending)" radius={8} />
            <Bar dataKey="attended" fill="var(--color-attended)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Department-wise invoice processing overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Displays total, pending, and attended invoices handled across each department for today.
        </div>
      </CardFooter>
    </Card>
  )
}
