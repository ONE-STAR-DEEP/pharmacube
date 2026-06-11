import { userReportColumns } from '@/components/admin/UserReportColumn'
import { DataTable } from '@/components/Datatable'
import { ChartBarInteractive } from '@/components/sample/chart2'
import { ChartBarMultiple } from '@/components/sample/chart3'
import { DateFilter } from '@/components/sample/DateFilter'
import { dashboardStats, dashboardStats2, userActionReport } from '@/lib/actions/stats'
import { DashboardStats } from '@/utils/types/DataTypes'

const defaultDashboardStats: DashboardStats = {
  warehouse: { user: "", total: 0, pending: 0, attended: 0 },
  checker: { user: "", total: 0, pending: 0, attended: 0 },
  reviewer: { user: "", total: 0, pending: 0, attended: 0 },
  rider: { user: "", total: 0, pending: 0, attended: 0 },
  delivery: { user: "", total: 0, pending: 0, attended: 0 },
  account: { user: "", total: 0, pending: 0, attended: 0 },
}

type PageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

const Dashboard = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const date = params?.date

  const data = await dashboardStats()
  const chartData = await dashboardStats2(date)
  const userReport = await userActionReport(date)

  return (
    <div className='space-y-4 py-4 px-2 md:px-0'>
      {/* <ChartAreaInteractive/> */}
      <ChartBarInteractive data={data?.data || []} />
      {/* 
      <div className='grid grid-cols-[30%_70%] gap-2 mr-4'>
        <ChartPieLabelList />
        <ChartPieDonutText />
      </div> 
      */}
      <div className='p-4 bg-white rounded-lg border border-black/15 flex items-center gap-2 text-sm font-semibold'>
        Date Filter:
        <DateFilter />
      </div>
      <ChartBarMultiple data={chartData?.data || defaultDashboardStats} />
      <div className='p-4 bg-white rounded-lg border border-black/15 space-y-8'>
        <div>
          <h2 className="text-lg font-semibold">User-wise Action Summary - <span className='text-xs'>({date})</span></h2>
          <p className="text-sm text-muted-foreground">
            Number of invoices processed by each user across all workflow stages.
          </p>
        </div>

        <DataTable data={Array.isArray(userReport.data) ? userReport.data : []} columns={userReportColumns} />
      </div>
    </div>
  )
}

export default Dashboard