import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function WeeklyChart({ data }) {
  if (!data) return null

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Calories',
        data: data.calories,
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0,212,170,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00d4aa',
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Goal',
        data: Array(data.labels.length).fill(data.calorie_goal),
        borderColor: 'rgba(139,92,246,0.5)',
        borderDash: [6, 4],
        fill: false,
        tension: 0,
        pointRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9898bb', font: { family: 'Inter' }, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(14,14,36,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#f0efff',
        bodyColor: '#9898bb',
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#5a5a88', font: { family: 'Inter', size: 12 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#5a5a88', font: { family: 'Inter', size: 12 } },
        beginAtZero: true,
      },
    },
  }

  return (
    <div style={{ height: 260 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
