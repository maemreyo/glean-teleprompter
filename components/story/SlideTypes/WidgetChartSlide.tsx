/**
 * Widget Chart Slide Component
 *
 * Displays interactive chart widgets (bar, line, pie, doughnut).
 * Simple SVG-based rendering for story format.
 *
 * @feature 012-standalone-story
 */

import React from 'react';
import type { WidgetChartSlide as WidgetChartSlideType } from '@/lib/story/types';

export interface WidgetChartSlideProps {
  slide: WidgetChartSlideType;
}

/**
 * Render a widget chart slide
 */
export function WidgetChartSlide({ slide }: WidgetChartSlideProps): React.JSX.Element {
  const { data } = slide;
  const { type, title, labels, values, colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] } = slide.data;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart(labels, values, colors);
      case 'pie':
      case 'doughnut':
        return renderPieChart(values, labels, colors, type === 'doughnut');
      case 'line':
        return renderLineChart(labels, values, colors[0]);
      default:
        return <div className="text-white">Unsupported chart type</div>;
    }
  };

  const renderBarChart = (labels: string[], values: number[], colors: string[]) => {
    const maxValue = Math.max(...values);
    const barWidth = 100 / labels.length;

    return (
      <div className="flex h-64 items-end justify-around gap-2 px-4">
        {labels.map((label, index) => {
          const height = (values[index] / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${height}%`,
                  width: `${barWidth * 0.8}%`,
                  backgroundColor: colors[index % colors.length],
                }}
              />
              <span className="mt-2 text-xs text-white">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = (values: number[], labels: string[], colors: string[], isDoughnut: boolean) => {
    const total = values.reduce((sum, value) => sum + value, 0);
    let currentAngle = -90; // Start from top

    const segments = values.map((value, index) => {
      const angle = (value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      // Convert to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Calculate coordinates
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      currentAngle = endAngle;

      return (
        <g key={index}>
          <path d={pathData} fill={colors[index % colors.length]} stroke="white" strokeWidth="1" />
          {/* Legend */}
          <text x={150} y={20 + index * 20} fill="white" fontSize="12">
            {labels[index]}: {value}
          </text>
        </g>
      );
    });

    return (
      <div className="flex items-center gap-8">
        <svg viewBox="0 0 300 200" className="h-64 w-64">
          <g>{segments}</g>
        </svg>
      </div>
    );
  };

  const renderLineChart = (labels: string[], values: number[], color: string) => {
    const maxValue = Math.max(...values);
    const points = values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 280 + 10;
        const y = 150 - (value / maxValue) * 140;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg viewBox="0 0 300 160" className="h-64 w-full">
        {/* Axes */}
        <line x1="10" y1="10" x2="10" y2="150" stroke="white" strokeWidth="1" />
        <line x1="10" y1="150" x2="290" y2="150" stroke="white" strokeWidth="1" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {values.map((value, index) => {
          const x = (index / (values.length - 1)) * 280 + 10;
          const y = 150 - (value / maxValue) * 140;
          return <circle key={index} cx={x} cy={y} r="4" fill={color} />;
        })}

        {/* Labels */}
        {labels.map((label, index) => {
          const x = (index / (labels.length - 1)) * 280 + 10;
          return (
            <text key={index} x={x} y="165" fill="white" fontSize="10" textAnchor="middle">
              {label}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      {title && <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>}
      <div className="flex-1">{renderChart()}</div>
    </div>
  );
}
