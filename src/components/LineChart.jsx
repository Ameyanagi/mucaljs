import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top',
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
        callback: function(value, index, ticks) {
          return Math.round(this.getLabelForValue(value) * 1000) / 1000
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

export function LineChart({ chartData, options = {} }) {
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
