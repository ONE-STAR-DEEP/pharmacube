"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart } from "recharts"

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

export const description = "A pie chart with a label list"

const chartData = [
  { browser: "Warehouse", visitors: 275, fill: "var(--color-Warehouse)" },
  { browser: "Checker", visitors: 200, fill: "var(--color-Checker)" },
  { browser: "Reviewer", visitors: 187, fill: "var(--color-Reviewer)" },
  { browser: "Rider", visitors: 173, fill: "var(--color-Rider)" },
  { browser: "Delivery", visitors: 90, fill: "var(--color-Delivery)" },
]

const chartConfig = {
  visitors: {
    label: "Invoices",
  },
  Warehouse: {
    label: "Warehouse",
    color: "var(--chart-1)",
  },
  Checker: {
    label: "Checker",
    color: "var(--chart-2)",
  },
  Reviewer: {
    label: "Reviewer",
    color: "var(--chart-3)",
  },
  Rider: {
    label: "Rider",
    color: "var(--chart-4)",
  },
  Delivery: {
    label: "Delivery",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartPieLabelList() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Label List</CardTitle>
        <CardDescription>March 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="visitors" hideLabel />}
            />
            <Pie data={chartData} dataKey="visitors">
              <LabelList
                dataKey="browser"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
