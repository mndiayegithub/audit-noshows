'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function GaugeBenchmark({ tauxActuel }: { tauxActuel: number }) {
  const [needleAngle, setNeedleAngle] = useState(-90);

  const maxValue = 20;
  const targetAngle = (Math.min(tauxActuel, maxValue) / maxValue) * 180 - 90;

  useEffect(() => {
    const id = setTimeout(() => setNeedleAngle(targetAngle), 50);
    return () => clearTimeout(id);
  }, [targetAngle]);

  let zone: string, zoneTexte: string, zoneColor: string;

  if (tauxActuel <= 5) {
    zone = 'VERTE';
    zoneTexte = 'Optimal — Excellent travail !';
    zoneColor = '#10b981';
  } else if (tauxActuel <= 7) {
    zone = 'ORANGE';
    zoneTexte = 'Attention — Surveillance nécessaire';
    zoneColor = '#f59e0b';
  } else if (tauxActuel <= 10) {
    zone = 'ORANGE FONCÉ';
    zoneTexte = 'Préoccupant — Action recommandée';
    zoneColor = '#ea580c';
  } else if (tauxActuel <= 15) {
    zone = 'ROUGE';
    zoneTexte = 'Critique — Action urgente requise';
    zoneColor = '#ef4444';
  } else {
    zone = 'ROUGE FONCÉ';
    zoneTexte = 'ALARME — Intervention immédiate';
    zoneColor = '#dc2626';
  }

  const data = {
    labels: [
      'Optimal (0-5%)',
      'Attention (5-7%)',
      'Préoccupant (7-10%)',
      'Critique (10-15%)',
      'Alarme (15-20%)',
    ],
    datasets: [
      {
        data: [5, 2, 3, 5, 5],
        backgroundColor: ['#10b981', '#f59e0b', '#ea580c', '#ef4444', '#dc2626'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      duration: 800,
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  const ecart = tauxActuel - 4.5;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="h-full"
    >
      <div className="bg-surface rounded-2xl border border-white/10 shadow-card p-6 h-full transition-all duration-300 hover:shadow-xl hover:shadow-black/25 hover:border-white/20">
        <h3 className="text-xl font-bold text-center text-slate-100 mb-6">
          🎯 Votre position vs secteur dentaire
        </h3>

        <div className="relative mx-auto" style={{ height: '240px', maxWidth: '100%' }}>
          <Doughnut data={data} options={options} />
          {/* Aiguille avec transition fluide */}
          <div
            className="absolute left-1/2 bottom-0 origin-bottom"
            style={{
              width: '4px',
              height: '90px',
              backgroundColor: '#1f2937',
              borderRadius: '2px 2px 0 0',
              transform: `translateX(-50%) rotate(${needleAngle}deg)`,
              transition: 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          <div
            className="absolute left-1/2 bottom-0"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#1f2937',
              border: '3px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transform: 'translateX(-50%) translateY(50%)',
            }}
          />
        </div>

        <div className="flex justify-between px-8 mt-2 text-xs">
          <span className="text-slate-400">0%</span>
          <span className="text-slate-400">10%</span>
          <span className="text-slate-400">20%+</span>
        </div>

        <div className="mt-6 text-center">
          <motion.div
            className="text-5xl font-bold mb-3"
            style={{ color: zoneColor }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {tauxActuel.toFixed(2)}%
          </motion.div>
          <div
            className="inline-block px-6 py-2 rounded-full text-white font-semibold text-sm"
            style={{ backgroundColor: zoneColor }}
          >
            Zone {zone}
          </div>
          <p className="mt-3 text-slate-300">{zoneTexte}</p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-400 mb-1">Taux optimal secteur</div>
              <div className="text-2xl font-bold text-green-600">4–5%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Votre écart</div>
              <div className="text-2xl font-bold" style={{ color: zoneColor }}>
                {ecart > 0 ? '+' : ''}
                {ecart.toFixed(2)} pts
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
