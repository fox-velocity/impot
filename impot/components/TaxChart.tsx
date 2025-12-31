import React, { useEffect, useRef } from 'react';
import { TaxBracketData } from '../types';
import Chart from 'chart.js/auto';

interface TaxChartProps {
  bracketData: TaxBracketData[];
  qf: number;
  parts: number;
  perSimulation: {
    investAmount: number;
    savingAmount: number;
    message: string;
  };
}

export const TaxChart: React.FC<TaxChartProps> = ({ bracketData, qf, parts, perSimulation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const sortedData = [...bracketData].sort((a, b) => a.rate - b.rate);
    const dataSets = sortedData.map(item => ({
      label: item.label,
      data: [item.amount * parts],
      backgroundColor: item.color,
      stack: 'stack1',
      borderWidth: 0,
      borderRadius: 4
    }));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: { labels: ['Revenu'], datasets: dataSets },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { display: false } } }
      }
    });

    return () => chartInstanceRef.current?.destroy();
  }, [bracketData, qf, parts]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Répartition par tranches</h3>
      <div className="h-24 w-full mb-6">
        <canvas ref={canvasRef} />
      </div>
      {perSimulation.investAmount > 0 && (
        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
          <p className="text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wide">💡 Optimisation fiscale</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Gain potentiel (PER) :</span>
            <span className="text-lg font-bold text-emerald-600">{perSimulation.savingAmount.toLocaleString()} €</span>
          </div>
        </div>
      )}
    </div>
  );
};