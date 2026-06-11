import { Square } from "lucide-react";
import { TooltipProps } from "recharts";

export function CustomTooltip(props: any) {
    const { active, payload, label } = props;

    if (!active || !payload?.length) return null;

    const row = payload[0].payload;

    return (
        <div className="rounded-lg border bg-background p-3 w-40 shadow-md">
            <p className="font-medium">
                {new Date(label).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })}
            </p>

            <div className="mt-2 space-y-1">
                <div className="flex justify-between gap-4">
                    <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-chart-1"></div>Total</span>
                    <span>{row.total}</span>
                </div>

                <div className="flex justify-between gap-4">
                    <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-chart-2"></div>Attended</span>
                    <span>{row.attended}</span>
                </div>

                <div className="flex justify-between gap-4">
                    <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-chart-3"></div>Pending</span>
                    <span>{row.total-row.attended}</span>
                </div>
            </div>
        </div>
    );
}