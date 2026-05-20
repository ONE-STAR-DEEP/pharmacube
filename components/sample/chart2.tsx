"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DashboardStat } from "@/utils/types/DataTypes"

export const description = "An interactive bar chart"

const chartData = [
  { date: "2024-04-01", total: 222, attended: 150 },
  { date: "2024-04-02", total: 97, attended: 180 },
  { date: "2024-04-03", total: 167, attended: 120 },
  { date: "2024-04-04", total: 242, attended: 20 },
  { date: "2024-04-05", total: 373, attended: 290 },
  { date: "2024-04-06", total: 301, attended: 340 },
  { date: "2024-04-07", total: 245, attended: 180 },
  { date: "2024-04-08", total: 409, attended: 20 },
  { date: "2024-04-09", total: 59, attended: 110 },
  { date: "2024-04-10", total: 261, attended: 190 },
  { date: "2024-04-11", total: 327, attended: 350 },
  { date: "2024-04-12", total: 292, attended: 210 },
  { date: "2024-04-13", total: 342, attended: 380 },
  { date: "2024-04-14", total: 137, attended: 220 },
  { date: "2024-04-15", total: 120, attended: 170 },
  { date: "2024-04-16", total: 138, attended: 190 },
  { date: "2024-04-17", total: 446, attended: 160 },
  { date: "2024-04-18", total: 364, attended: 410 },
  { date: "2024-04-19", total: 243, attended: 180 },
  { date: "2024-04-20", total: 89, attended: 150 },
  { date: "2024-04-21", total: 137, attended: 200 },
  { date: "2024-04-22", total: 224, attended: 170 },
  { date: "2024-04-23", total: 138, attended: 230 },
  { date: "2024-04-24", total: 387, attended: 290 },
  { date: "2024-04-25", total: 215, attended: 250 },
  { date: "2024-04-26", total: 75, attended: 130 },
  { date: "2024-04-27", total: 383, attended: 220 },
  { date: "2024-04-28", total: 122, attended: 180 },
  { date: "2024-04-29", total: 315, attended: 240 },
  { date: "2024-04-30", total: 454, attended: 380 },
  { date: "2024-05-01", total: 165, attended: 220 },
  { date: "2024-05-02", total: 293, attended: 310 },
  { date: "2024-05-03", total: 247, attended: 190 },
  { date: "2024-05-04", total: 385, attended: 420 },
  { date: "2024-05-05", total: 481, attended: 390 },
  { date: "2024-05-06", total: 498, attended: 520 },
  { date: "2024-05-07", total: 388, attended: 300 },
  { date: "2024-05-08", total: 149, attended: 210 },
  { date: "2024-05-09", total: 227, attended: 180 },
  { date: "2024-05-10", total: 293, attended: 330 },
  { date: "2024-05-11", total: 335, attended: 270 },
  { date: "2024-05-12", total: 197, attended: 240 },
  { date: "2024-05-13", total: 197, attended: 160 },
  { date: "2024-05-14", total: 448, attended: 490 },
  { date: "2024-05-15", total: 473, attended: 380 },
  { date: "2024-05-16", total: 338, attended: 400 },
  { date: "2024-05-17", total: 499, attended: 420 },
  { date: "2024-05-18", total: 315, attended: 350 },
  { date: "2024-05-19", total: 235, attended: 180 },
  { date: "2024-05-20", total: 177, attended: 230 },
  { date: "2024-05-21", total: 82, attended: 140 },
  { date: "2024-05-22", total: 81, attended: 120 },
  { date: "2024-05-23", total: 252, attended: 290 },
  { date: "2024-05-24", total: 294, attended: 220 },
  { date: "2024-05-25", total: 201, attended: 250 },
  { date: "2024-05-26", total: 213, attended: 170 },
  { date: "2024-05-27", total: 420, attended: 460 },
  { date: "2024-05-28", total: 233, attended: 190 },
  { date: "2024-05-29", total: 78, attended: 130 },
  { date: "2024-05-30", total: 340, attended: 280 },
  { date: "2024-05-31", total: 178, attended: 230 },
  { date: "2024-06-01", total: 178, attended: 200 },
  { date: "2024-06-02", total: 470, attended: 410 },
  { date: "2024-06-03", total: 103, attended: 160 },
  { date: "2024-06-04", total: 439, attended: 380 },
  { date: "2024-06-05", total: 88, attended: 140 },
  { date: "2024-06-06", total: 294, attended: 250 },
  { date: "2024-06-07", total: 323, attended: 370 },
  { date: "2024-06-08", total: 385, attended: 320 },
  { date: "2024-06-09", total: 438, attended: 480 },
  { date: "2024-06-10", total: 155, attended: 200 },
  { date: "2024-06-11", total: 92, attended: 150 },
  { date: "2024-06-12", total: 492, attended: 420 },
  { date: "2024-06-13", total: 81, attended: 130 },
  { date: "2024-06-14", total: 426, attended: 380 },
  { date: "2024-06-15", total: 307, attended: 350 },
  { date: "2024-06-16", total: 371, attended: 310 },
  { date: "2024-06-17", total: 475, attended: 520 },
  { date: "2024-06-18", total: 107, attended: 170 },
  { date: "2024-06-19", total: 341, attended: 290 },
  { date: "2024-06-20", total: 408, attended: 450 },
  { date: "2024-06-21", total: 169, attended: 210 },
  { date: "2024-06-22", total: 317, attended: 270 },
  { date: "2024-06-23", total: 480, attended: 530 },
  { date: "2024-06-24", total: 132, attended: 180 },
  { date: "2024-06-25", total: 141, attended: 190 },
  { date: "2024-06-26", total: 434, attended: 380 },
  { date: "2024-06-27", total: 448, attended: 490 },
  { date: "2024-06-28", total: 149, attended: 200 },
  { date: "2024-06-29", total: 103, attended: 160 },
  { date: "2024-06-30", total: 446, attended: 400 },
]

const chartConfig = {
  views: {
    label: "Invoices",
  },
  total: {
    label: "Total",
    color: "var(--chart-2)",
  },
  attended: {
    label: "Attended",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type Props = {
  data: DashboardStat[]
}

export function ChartBarInteractive(data: Props) {

  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("total")

  const total = React.useMemo(
    () => ({
      total: data.data.reduce((acc, curr) => acc + curr.total, 0),
      attended: data.data.reduce((acc, curr) => acc + curr.attended, 0),
    }),
    []
  )

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>Invoice Activity</CardTitle>
          <CardDescription>
            Showing total Invoices up to last 90 days
          </CardDescription>
        </div>
        <div className="flex">
          {["total", "attended"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data.data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
