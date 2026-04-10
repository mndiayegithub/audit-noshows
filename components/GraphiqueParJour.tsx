'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ParJourItem {
  jour: string;
  total_rdv: number;
  no_shows: number;
  taux: number;
}

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function GraphiqueParJour({ parJour }: { parJour: ParJourItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (inView) {
      let start: number | null = null;
      const duration = 1400; // Même durée que la jauge
      
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const currentProgress = Math.min((timestamp - start) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - currentProgress, 3); // easeOutCubic
        setProgress(easeProgress);
        
        if (currentProgress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setProgress(1);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [inView]);

  const ordre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const donneesSorted = ordre
    .map((j) => parJour.find((d) => d.jour === j))
    .filter(Boolean) as ParJourItem[];

  const data = useMemo(
    () => ({
      labels: donneesSorted.map((d) => d.jour),
      datasets: [
        {
          label: 'Taux no-shows (%)',
          // Appliquer la progression sur chaque barre
          data: donneesSorted.map((d) => d.taux * progress),
          backgroundColor: donneesSorted.map((d) => {
            if (d.taux < 5) return '#10b981';
            if (d.taux < 10) return '#f59e0b';
            return '#ef4444';
          }),
          borderRadius: 8,
          barThickness: 28,
        },
      ],
    }),
    [donneesSorted, progress]
  );

  const options = useMemo(
    () => ({
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0, // Désactivé car on gère l'animation nous-mêmes via react state
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: '📊 Répartition des no-shows par jour de la semaine',
          font: { size: 16, weight: 'bold' as const },
          padding: 20,
          color: '#334155',
        },
        tooltip: {
          callbacks: {
            label: function (context: { dataIndex: number }) {
              const item = donneesSorted[context.dataIndex];
              return [
                `Taux : ${item.taux.toFixed(2)}%`,
                `No-shows : ${item.no_shows}/${item.total_rdv} RDV`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 25,
          ticks: {
            callback: (value: string | number) =>
              typeof value === 'number' ? `${value}%` : value,
            color: '#64748b',
          },
          grid: { color: '#f1f5f9' },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#0f172a' },
        },
      },
    }),
    [donneesSorted]
  );

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="h-full"
    >
      <div className="glass-panel bg-white/60 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col p-2">
        <div className="flex-1 relative min-h-[300px]">
          <Bar data={data} options={options} />
        </div>
      </div>
    </motion.div>
  );
}
