import { ChartAreaInteractive } from '@/components/sample/chart1'
import { ChartBarInteractive } from '@/components/sample/chart2'
import { ChartBarMultiple } from '@/components/sample/chart3'
import { ChartPieLabelList } from '@/components/sample/pie1'
import { ChartPieDonutText } from '@/components/sample/pie2'
import { dashboardStats, dashboardStats2 } from '@/lib/actions/stats'
import { DashboardStats } from '@/utils/types/DataTypes'

const defaultDashboardStats: DashboardStats = {
  warehouse: { user: "", total: 0, pending: 0, attended: 0 },
  checker: { user: "", total: 0, pending: 0, attended: 0 },
  reviewer: { user: "", total: 0, pending: 0, attended: 0 },
  rider: { user: "", total: 0, pending: 0, attended: 0 },
  delivery: { user: "", total: 0, pending: 0, attended: 0 },
  account: { user: "", total: 0, pending: 0, attended: 0 },
}

const Dashboard = async () => {

  const data = await dashboardStats()
  const chartData = await dashboardStats2()

  return (
    <div className='space-y-4 py-4'>
      {/* <ChartAreaInteractive/> */}
      <ChartBarInteractive data={data?.data || []} />
      <div className='grid grid-cols-[30%_70%] gap-2 mr-4'>
        {/* <ChartPieLabelList /> */}
        {/* <ChartPieDonutText /> */}
      </div>
        <ChartBarMultiple data={chartData?.data || defaultDashboardStats} />
    </div>
  )
}

export default Dashboard