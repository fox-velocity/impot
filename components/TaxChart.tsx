import React, { useEffect, useRef } from 'react';
import { TaxBracketData } from '../types';
import Chart from 'chart.js/auto';
import { Lightbulb } from 'lucide-react';

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
    if (!canvasRef.current || !bracketData.length) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Revenu Imposable'],
        datasets: bracketData.map(b => ({
          label: `Tranche ${b.label}`,
          data: [b.amount * parts],
          backgroundColor: b.color,
          stack: 'stack1',
          borderWidth: 1,
          borderColor: '#ffffff',
        }))
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
            x: { stacked: true, grid: { display: false } }, 
            y: { stacked: true, grid: { display: false } } 
        }
      }
    });
  }, [bracketData, qf, parts]);

  const currentTmi = bracketData.length > 0 ? Math.max(...bracketData.map(b => b.rate)) : 0;
  const savingPer1000 = Math.round(currentTmi * 1000);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Répartition par Tranche</h3>
        <div className="h-32 w-full"><canvas ref={canvasRef} /></div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-4 justify-center">
          {bracketData.map((b, i) => (
            <div key={i} className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }}></span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BLOC OPTIMISATION PER */}
      <div className="bg-[#f8fafc] rounded-2xl p-8 border border-[#e2e8f0] shadow-sm animate-in fade-in duration-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="text-yellow-500 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
            <Lightbulb size={24} fill="currentColor" />
          </div>
          <h4 className="text-xl font-bold text-[#1e293b]">Optimisation PER</h4>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[#475569] text-base">{perSimulation.message}</p>
            {currentTmi > 0 && (
              <div className="inline-block bg-[#eff6ff] text-[#2563eb] px-4 py-2 rounded-lg text-sm font-bold border border-[#dbeafe] shadow-sm">
                Gain de {savingPer1000.toLocaleString('fr-FR')} € pour 1 000 € versés.
              </div>
            )}
          </div>

          {currentTmi > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block px-1">POUR VIDER LA TRANCHE ACTUELLE</label>
                <div className="w-full bg-white border border-[#cbd5e1] rounded-2xl p-6 text-2xl font-bold text-[#1e293b] flex justify-between items-center shadow-sm">
                  <span>{perSimulation.investAmount.toLocaleString('fr-FR')}</span>
                  <span className="text-[#94a3b8] font-normal">€</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#15803d] uppercase tracking-widest block px-1">ÉCONOMIE D'IMPÔT GÉNÉRÉE</label>
                <div className="w-full bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6 text-3xl font-black text-[#15803d] flex justify-between items-center shadow-sm">
                  <span>{perSimulation.savingAmount.toLocaleString('fr-FR')}</span>
                  <span className="text-[#86efac] font-normal">€</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/50 p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-sm italic">
              Le PER n'offre pas d'avantage fiscal immédiat pour les foyers non imposables.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};