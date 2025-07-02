'use client'

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card'

interface RatingsData {
  work_quality: number
  availability: number
  friendliness: number
  total_ratings: number
}

interface RatingsChartProps {
  data: RatingsData
  className?: string
}

export function RatingsChart({ data, className }: RatingsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Work Quality', 'Availability', 'Friendliness'],
        datasets: [
          {
            data: [data.work_quality, data.availability, data.friendliness],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)', // blue-600
              'rgba(34, 197, 94, 0.8)',  // green-600
              'rgba(147, 51, 234, 0.8)'  // purple-600
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(34, 197, 94)',
              'rgb(147, 51, 234)'
            ],
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 40
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw as number
                return `Rating: ${value.toFixed(1)}/10`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Your Performance Ratings
        </CardTitle>
        <CardDescription>
          Average ratings from {data.total_ratings} completed jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
} 