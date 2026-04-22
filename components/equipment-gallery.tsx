'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface EquipmentGif {
  file: string;
  exercises: string[];
  intensity: string;
  score: number;
}

interface EquipmentMetadata {
  [equipment: string]: EquipmentGif[];
}

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: '🏋️ Barbell',
  dumbbell: '💪 Dumbbell',
  cable: '🔗 Cable Machine',
  plate_loaded: '⚙️ Plate Loaded',
  bodyweight: '🤸 Bodyweight',
  trx: '🪢 TRX',
  resistance_band: '🎯 Resistance Band',
};

export default function EquipmentGallery() {
  const [metadata, setMetadata] = useState<EquipmentMetadata>({});
  const [selectedEquipment, setSelectedEquipment] = useState<string>('barbell');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/equipment-gifs/metadata.json')
      .then(r => r.json())
      .then(data => {
        setMetadata(data);
        const firstEquipment = Object.keys(data).sort()[0];
        if (firstEquipment) setSelectedEquipment(firstEquipment);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading equipment metadata:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4">Loading equipment guides...</div>;
  }

  const gifs = metadata[selectedEquipment] || [];
  const equipment = Object.keys(metadata).filter(e => metadata[e].length > 0).sort();

  return (
    <div className="equipment-gallery">
      <h2 className="section-label">Equipment Guides</h2>

      {/* Equipment selector */}
      <div className="equipment-tabs">
        {equipment.map(eq => (
          <button
            key={eq}
            onClick={() => setSelectedEquipment(eq)}
            className={`equipment-tab ${selectedEquipment === eq ? 'active' : ''}`}
            title={`${metadata[eq].length} examples`}
          >
            {EQUIPMENT_LABELS[eq] || eq}
          </button>
        ))}
      </div>

      {/* GIF gallery */}
      <div className="gifs-grid">
        {gifs.map((gif, i) => (
          <div key={i} className="gif-card">
            <div className="gif-container">
              <img
                src={`/equipment-gifs/${selectedEquipment}/${gif.file}`}
                alt={gif.exercises.join(', ')}
                className="gif-image"
              />
            </div>
            <div className="gif-info">
              <div className="gif-exercises">
                {gif.exercises.slice(0, 2).map((ex, j) => (
                  <span key={j} className="exercise-tag">{ex}</span>
                ))}
              </div>
              <div className="gif-intensity">
                Intensity: <span className={`intensity-${gif.intensity.toLowerCase()}`}>
                  {gif.intensity}
                </span>
              </div>
              <div className="gif-score">
                Score: <strong>{Math.round(gif.score)}/100</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .equipment-gallery {
          padding: 1rem 0;
        }

        .equipment-tabs {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          padding-bottom: 0.5rem;
        }

        .equipment-tab {
          padding: 0.5rem 1rem;
          background: #222;
          border: 1px solid #333;
          color: #aaa;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .equipment-tab:hover {
          background: #333;
          color: #fff;
        }

        .equipment-tab.active {
          background: #4CAF50;
          color: #000;
          border-color: #4CAF50;
        }

        .gifs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .gif-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .gif-card:hover {
          border-color: #4CAF50;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
        }

        .gif-container {
          background: #000;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .gif-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gif-info {
          padding: 1rem;
          background: #111;
        }

        .gif-exercises {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
        }

        .exercise-tag {
          display: inline-block;
          background: #333;
          padding: 0.25rem 0.6rem;
          border-radius: 3px;
          font-size: 0.75rem;
          color: #aaa;
        }

        .gif-intensity {
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 0.3rem;
        }

        .intensity-high {
          color: #ff6b6b;
          font-weight: 600;
        }

        .intensity-moderate {
          color: #ffb74d;
          font-weight: 600;
        }

        .intensity-low {
          color: #69f0ae;
          font-weight: 600;
        }

        .gif-score {
          font-size: 0.85rem;
          color: #888;
        }

        .gif-score strong {
          color: #4CAF50;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
