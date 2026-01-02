import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, type ChartOptions } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ChartDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  pointRadius: number
  borderWidth: number
}

interface ChartData {
  labels: number[]
  datasets: ChartDataset[]
}

interface LineChartProps {
  chartData: ChartData
  options?: Partial<ChartOptions<'line'>>
}

const defaultOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Energy (keV)',
      },
      ticks: {
        callback: function(value) {
          const label = this.getLabelForValue(value as number)
          return Math.round(Number(label) * 1000) / 1000
        },
        maxTicksLimit: 10,
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Absorption',
      },
    },
  },
}

export function LineChart({ chartData, options = {} }: LineChartProps) {
  const mergedOptions = { ...defaultOptions, ...options }

  if (!chartData || !chartData.datasets) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Absorption Spectrum</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-[4/3]">
          <Line data={chartData} options={mergedOptions} />
        </div>
      </CardContent>
    </Card>
  )
}

export default LineChart
