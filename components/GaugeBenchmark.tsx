'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GaugeBenchmark({ tauxActuel }: { tauxActuel: number }) {
  let zone: string, zoneTexte: string, zoneColor: string;

  if (tauxActuel <= 5) {
    zone = 'VERTE'; zoneTexte = 'Optimal — Excellent travail !'; zoneColor = '#10b981';
  } else if (tauxActuel <= 7) {
    zone = 'ORANGE'; zoneTexte = 'Attention — Surveillance nécessaire'; zoneColor = '#f59e0b';
  } else if (tauxActuel <= 10) {
    zone = 'ORANGE FONCÉ'; zoneTexte = 'Préoccupant — Action recommandée'; zoneColor = '#ea580c';
  } else if (tauxActuel <= 15) {
    zone = 'ROUGE'; zoneTexte = 'Critique — Action urgente requise'; zoneColor = '#ef4444';
  } else {
    zone = 'ROUGE FONCÉ'; zoneTexte = 'ALARME — Intervention immédiate'; zoneColor = '#dc2626';
  }

  const data = {
    labels: ['Optimal (0-5%)', 'Attention (5-7%)', 'Préoccupant (7-10%)', 'Critique (10-15%)', 'Alarme (15-20%)'],
    datasets: [{
      data: [5, 2, 3, 5, 5],
      backgroundColor: ['#10b981', '#f59e0b', '#ea580c', '#ef4444', '#dc2626'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  const maxValue = 20;
  const needleValue = Math.min(tauxActuel, maxValue);
  const needleAngle = (needleValue / maxValue) * 180 - 90;
  const ecart = tauxActuel - 4.5;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
        🎯 Votre position vs secteur dentaire
      </h3>

      <div className="relative mx-auto" style={{ height: '200px', maxWidth: '400px' }}>
        <Doughnut data={data} options={options} />
        {/* Aiguille */}
        <div
          className="absolute left-1/2 bottom-0"
          style={{
            width: '4px',
            height: '90px',
            backgroundColor: '#1f2937',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${needleAngle}deg)`,
            transition: 'transform 1.2s ease-out',
            borderRadius: '2px 2px 0 0'
          }}
        />
        {/* Point pivot */}
        <div
          className="absolute left-1/2 bottom-0"
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#1f2937',
            border: '3px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transform: 'translateX(-50%) translateY(50%)'
          }}
        />
      </div>

      <div className="flex justify-between px-8 mt-2 text-xs text-gray-500">
        <span>0%</span>
        <span>10%</span>
        <span>20%+</span>
      </div>

      <div className="mt-6 text-center">
        <div className="text-5xl font-bold mb-3" style={{ color: zoneColor }}>
          {tauxActuel.toFixed(2)}%
        </div>
        <div
          className="inline-block px-6 py-2 rounded-full text-white font-semibold text-sm"
          style={{ backgroundColor: zoneColor }}
        >
          Zone {zone}
        </div>
        <p className="mt-3 text-gray-600">{zoneTexte}</p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Taux optimal secteur</div>
            <div className="text-2xl font-bold text-green-600">4–5%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Votre écart</div>
            <div className="text-2xl font-bold" style={{ color: zoneColor }}>
              {ecart > 0 ? '+' : ''}{ecart.toFixed(2)} pts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
