import { ChartAreaInteractive } from '@/components/sample/chart1'
import { ChartBarInteractive } from '@/components/sample/chart2'
import { ChartBarMultiple } from '@/components/sample/chart3'
import { ChartPieLabelList } from '@/components/sample/pie1'
import { ChartPieDonutText } from '@/components/sample/pie2'
import React from 'react'

const Dashboard = () => {
  return (
    <div className='space-y-4 '>
      <ChartAreaInteractive/>
      <ChartBarInteractive/>
      <div className='grid grid-cols-[25%_25%_50%] gap-2 mr-4'>
        <ChartPieLabelList/>
        <ChartPieDonutText/>
        <ChartBarMultiple/>
      </div>
    </div>
  )
}

export default Dashboard