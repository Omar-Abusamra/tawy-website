import React, { useState } from 'react';
import './SizeGuide.css';

const MEASUREMENT_TIPS = {
  shoulder: 'Measure from shoulder point to shoulder point',
  sleeve: 'Measure from shoulder seam to cuff',
  bust: 'Measure around the fullest part of your bust',
  hip: 'Measure around the fullest part of your hips',
  length: 'Measure from shoulder to hem',
  collar: 'Measure around the base of the neck where the collar sits',
  chest: 'Measure around the fullest part of your chest',
  waist: 'Measure around your natural waistline',
  thigh: 'Measure around the fullest part of your thigh',
  'leg opening': 'Measure around the hem opening of the pant leg',
};

const sizeCharts = {
  dresses: {
    title: 'Dresses',
    unit: 'cm',
    hasInternationalSizes: false,
    measurements: ['Shoulder', 'Sleeve', 'Bust', 'Hip', 'Length'],
    sizes: {
      S: { shoulder: '38', sleeve: '58', bust: '28', hip: '58', length: '104' },
      M: { shoulder: '40', sleeve: '59', bust: '60', hip: '60', length: '143' },
      L: { shoulder: '42', sleeve: '61', bust: '62', hip: '62', length: '145' },
    },
  },
  shirts: {
    title: 'Shirts',
    unit: 'cm',
    hasInternationalSizes: false,
    measurements: ['Collar', 'Shoulder', 'Sleeve', 'Chest', 'Length'],
    sizes: {
      S: { collar: '40', shoulder: '46', sleeve: '20', chest: '56', length: '62' },
      M: { collar: '42', shoulder: '48', sleeve: '21', chest: '58', length: '65' },
      L: { collar: '44', shoulder: '50', sleeve: '22', chest: '60', length: '68' },
    },
  },
  pants: {
    title: 'Pants',
    unit: 'cm',
    hasInternationalSizes: false,
    measurements: ['Waist', 'Hip', 'Thigh', 'Length', 'Leg Opening'],
    sizes: {
      S: { waist: '40', hip: '102', thigh: '31', length: '102', 'leg opening': '25' },
      M: { waist: '42', hip: '104', thigh: '33', length: '103', 'leg opening': '26' },
      L: { waist: '44', hip: '106', thigh: '35', length: '104', 'leg opening': '27' },
    },
  },
};

const SizeGuide = ({ isOpen, onClose, productType = 'dresses' }) => {
  const [selectedCategory, setSelectedCategory] = useState(
    sizeCharts[productType] ? productType : 'dresses'
  );

  const currentChart = sizeCharts[selectedCategory] || sizeCharts.dresses;
  const showInternationalSizes = currentChart.hasInternationalSizes !== false;
  const measurementUnit = currentChart.unit || 'cm';
  const sizeLabels = Object.keys(currentChart.sizes);

  if (!isOpen) return null;

  return (
    <div className="size-guide-overlay" onClick={onClose}>
      <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
        <button className="size-guide-close" onClick={onClose}>
          ×
        </button>

        <div className="size-guide-header">
          <h2>Size Guide</h2>
          <p>Find your perfect fit with our detailed sizing charts</p>
        </div>

        <div className="size-guide-categories">
          {Object.keys(sizeCharts).map((category) => (
            <button
              key={category}
              className={`size-guide-category ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {sizeCharts[category].title}
            </button>
          ))}
        </div>

        <div className="size-guide-content">
          <div className="size-guide-table-container">
            <table className="size-guide-table">
              <thead>
                <tr>
                  <th className="size-guide-corner">Size</th>
                  {sizeLabels.map((size) => (
                    <th key={size}>{size}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentChart.measurements.map((measurement) => (
                  <tr key={measurement}>
                    <td className="size-label">{measurement}</td>
                    {sizeLabels.map((size) => (
                      <td key={size}>{currentChart.sizes[size][measurement.toLowerCase()]}</td>
                    ))}
                  </tr>
                ))}
                {showInternationalSizes && (
                  <>
                    <tr>
                      <td className="size-label">EU</td>
                      {sizeLabels.map((size) => (
                        <td key={size}>{currentChart.sizes[size].eu}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="size-label">UK</td>
                      {sizeLabels.map((size) => (
                        <td key={size}>{currentChart.sizes[size].uk}</td>
                      ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="size-guide-tips">
            <h4>How to Measure</h4>
            <div className="size-guide-tips-grid">
              {currentChart.measurements.map((measurement) => (
                <div className="size-guide-tip" key={measurement}>
                  <strong>{measurement}:</strong> {MEASUREMENT_TIPS[measurement.toLowerCase()]}
                </div>
              ))}
            </div>
          </div>

          <div className="size-guide-note">
            <p>
              <strong>Note:</strong> All measurements are in {measurementUnit}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
