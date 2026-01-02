import React, { useEffect, useRef } from 'react';
import { TaxBracketData } from '../types';
import Chart from 'chart.js/auto';
import { Lightbulb, TrendingDown, ArrowRight } from 'lucide-react';

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
      borderRadius: 8,
      barThickness: 40
    }));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: { labels: ['Revenu Imposable'], datasets: dataSets },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 11 },
                callbacks: {
                    label: (context) => `${context.dataset.label} : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(context.parsed.x)}`
                }
            }
        },
        scales: { 
            x: { 
                stacked: true, 
                grid: { display: false },
                ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' }
            }, 
            y: { 
                stacked: true, 
                grid: { display: false },
                display: false
            } 
        }
      }
    });

    return () => chartInstanceRef.current?.destroy();
  }, [bracketData, qf, parts]);

  return (
    <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Structure de l'imposition</h3>
            <div className="h-28 w-full mb-8">
                <canvas ref={canvasRef} />
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
                {bracketData.map((b, i) => (
                    <div key={i} className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }}></span>
                        <span className="text-[10px] font-black text-slate-600">{b.label}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* PER Optimizer Block */}
        {perSimulation.investAmount > 0 && (
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Lightbulb size={24} className="text-yellow-300" />
                        </div>
                        <h4 className="text-xl font-black">Optimisation Fiscale PER</h4>
                    </div>

                    <p className="text-indigo-100 text-sm leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: perSimulation.message }} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-2xl">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Montant à investir</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black">{perSimulation.investAmount.toLocaleString()} €</span>
                                <TrendingDown size={20} className="text-indigo-300" />
                            </div>
                        </div>
                        <div className="bg-emerald-500 p-5 rounded-2xl shadow-lg shadow-emerald-900/20">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 mb-1">Gain d'impôt immédiat</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black">-{perSimulation.savingAmount.toLocaleString()} €</span>
                                <ArrowRight size={20} className="text-emerald-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};