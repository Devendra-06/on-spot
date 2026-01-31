'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { statsService, RevenueData } from '@/app/services/stats.service';
import { Icon } from '@iconify/react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const RevenueChart = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await statsService.getRevenue();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch revenue stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      animations: { speed: 500 },
    },
    colors: ['#10B981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [50, 100],
      },
    },
    grid: {
      borderColor: '#90A4AE30',
      strokeDashArray: 3,
    },
    xaxis: {
      categories: data?.daily.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#9CA3AF' } },
    },
    yaxis: {
      labels: {
        style: { colors: '#9CA3AF' },
        formatter: (val) => `$${val.toFixed(0)}`,
      },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => `$${val.toFixed(2)}` },
    },
  };

  const series = [
    {
      name: 'Revenue',
      data: data?.daily.map((d) => d.revenue) || [],
    },
  ];

  if (loading) {
    return (
      <div className="rounded-xl shadow-xs bg-white dark:bg-darkgray p-6 h-[400px] flex items-center justify-center">
        <Icon icon="svg-spinners:ring-resize" className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-xs bg-white dark:bg-darkgray p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h5 className="card-title">Revenue Trends</h5>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">${data?.total.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
      </div>
      <div className="-ms-4 -me-3">
        <Chart options={options} series={series} type="area" height="280px" width="100%" />
      </div>
    </div>
  );
};

export default RevenueChart;
