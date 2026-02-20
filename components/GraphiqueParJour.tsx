'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ParJourItem {
  jour: string;
  total_rdv: number;
  no_shows: number;
  taux: number;
}

export default function GraphiqueParJour({ parJour }: { parJour: ParJourItem[] }) {
  const ordre = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const donneesSorted = ordre
    .map(j => parJour.find(d => d.jour === j))
    .filter(Boolean) as ParJourItem[];

  if (donneesSorted.length === 0) return null;

  const data = {
    labels: donneesSorted.map(d => d.jour),
    datasets: [{
      label: 'Taux no-shows (%)',
      data: donneesSorted.map(d => d.taux),
      backgroundColor: donneesSorted.map(d => {
        if (d.taux < 5) return '#10b981';
        if (d.taux < 10) return '#f59e0b';
        return '#ef4444';
      }),
      borderRadius: 8,
      barThickness: 28,
    }]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '📊 Répartition des no-shows par jour de la semaine',
        font: { size: 16, weight: 'bold' as const },
        padding: 20,
        color: '#e2e8f0'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const item = donneesSorted[context.dataIndex];
            return [
              `Taux : ${item.taux.toFixed(2)}%`,
              `No-shows : ${item.no_shows}/${item.total_rdv} RDV`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 25,
        ticks: {
          callback: (value: any) => value + '%',
          color: '#94a3b8'
        },
        grid: { color: 'rgba(255,255,255,0.08)' }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#cbd5e1' }
      }
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-white/10 shadow-card p-6 h-full">
      <div style={{ height: '380px' }}>
        <Bar data={data} options={options} />
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span>Optimal (&lt; 5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Attention (5-10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Critique (&gt; 10%)</span>
        </div>
      </div>
    </div>
  );
}
