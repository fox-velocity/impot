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

    // Destroy previous instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Préparation des données
    const dataSets: any[] = [];
    let currentTaxableIncome = 0;
    
    // Sort logic handled in engine, but safe to ensure
    const sortedData = [...bracketData].sort((a, b) => a.rate - b.rate);

    sortedData.forEach(item => {
        const limit = item.amount * parts;
        if (limit > 0) {
            dataSets.push({
                label: `Tranche ${item.label}`,
                data: [limit],
                backgroundColor: item.color,
                stack: 'stack1',
                borderWidth: 1,
                borderColor: '#ffffff',
            });
            currentTaxableIncome += limit;
        }
    });

    const totalRNI = qf * parts;
    const remainingRNI = Math.max(0, totalRNI - currentTaxableIncome);
    
    // Tranche vide ou restante
    if (remainingRNI > 0 || currentTaxableIncome === 0) {
        dataSets.unshift({ // Put at start to be at the bottom/left of stack depending on axis
            label: 'Non Imposable (0%)',
            data: [remainingRNI > 0 ? remainingRNI : (totalRNI > 0 ? totalRNI : 1000)],
            backgroundColor: '#e5e7eb',
            stack: 'stack1',
            borderWidth: 1,
            borderColor: '#ffffff',
        });
    }

    // Création du graph
    chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Revenu Net Imposable'],
            datasets: dataSets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(context.parsed.x);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    max: totalRNI > 0 ? totalRNI * 1.1 : 10000,
                    grid: { display: false }
                },
                y: {
                    stacked: true,
                    grid: { display: false }
                }
            }
        }
    });

    return () => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
    };
  }, [bracketData, qf, parts]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Répartition par Tranche</h3>
      
      <div className="relative h-48 w-full mb-6">
        <canvas ref={canvasRef} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-6 justify-center">
        {bracketData.map((b, i) => (
            <div key={i} className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }}></span>
                <span>{b.label}</span>
            </div>
        ))}
      </div>

      {/* PER Simulator */}
      {perSimulation.investAmount > 0 && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
             <h4 className="font-semibold text-slate-800 mb-2">💡 Optimisation PER</h4>
             <p className="text-sm text-slate-600 mb-3" dangerouslySetInnerHTML={{ __html: perSimulation.message }} />
             
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <span className="text-xs text-slate-500 uppercase font-bold">À Investir</span>
                     <div className="p-2 bg-white border border-slate-300 rounded font-mono text-slate-800">
                        {perSimulation.investAmount.toLocaleString('fr-FR')} €
                     </div>
                 </div>
                 <div>
                     <span className="text-xs text-slate-500 uppercase font-bold text-green-700">Gain Impôt</span>
                     <div className="p-2 bg-green-50 border border-green-200 rounded font-mono text-green-800 font-bold">
                        {perSimulation.savingAmount.toLocaleString('fr-FR')} €
                     </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};