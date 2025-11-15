import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Traits } from '../../types/entities';

interface TraitRadarChartProps {
  traits: Traits;
  width?: number;
  height?: number;
}

const TOP_TRAITS = [
  'size',
  'speed',
  'intelligence',
  'photosynthesis',
  'visionRange',
  'chemotaxis',
  'toxinStrength',
  'armor',
  'energyEfficiency',
  'aggression',
] as const;

const TRAIT_LABELS: Record<typeof TOP_TRAITS[number], string> = {
  size: 'Size',
  speed: 'Speed',
  intelligence: 'Intelligence',
  photosynthesis: 'Photosynthesis',
  visionRange: 'Vision',
  chemotaxis: 'Smell',
  toxinStrength: 'Toxin',
  armor: 'Armor',
  energyEfficiency: 'Efficiency',
  aggression: 'Aggression',
};

export const TraitRadarChart: React.FC<TraitRadarChartProps> = ({
  traits,
  width = 400,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    const center = { x: width / 2, y: height / 2 };

    const g = svg.append('g').attr('transform', `translate(${center.x},${center.y})`);

    // Normalize values to 0-10 range
    const normalizeValue = (key: typeof TOP_TRAITS[number], value: number): number => {
      switch (key) {
        case 'visionRange':
          return ((value - 50) / (500 - 50)) * 10; // 50-500 -> 0-10
        default:
          return value; // Already 0-10
      }
    };

    // Prepare data
    const data = TOP_TRAITS.map(key => ({
      trait: TRAIT_LABELS[key],
      value: normalizeValue(key, traits[key] as number),
      rawValue: traits[key] as number,
    }));

    const maxValue = 10;
    const levels = 5;
    const angleSlice = (Math.PI * 2) / data.length;

    // Scale
    const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

    // Draw circular grid
    for (let i = 0; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;

      g.append('circle')
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', '#444')
        .attr('stroke-width', 1);

      if (i > 0) {
        g.append('text')
          .attr('x', 5)
          .attr('y', -levelRadius)
          .attr('fill', '#888')
          .attr('font-size', '10px')
          .text(((maxValue / levels) * i).toFixed(0));
      }
    }

    // Draw axes
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const lineEnd = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', lineEnd.x)
        .attr('y2', lineEnd.y)
        .attr('stroke', '#444')
        .attr('stroke-width', 1);

      // Labels
      const labelDistance = radius + 20;
      const labelPos = {
        x: Math.cos(angle) * labelDistance,
        y: Math.sin(angle) * labelDistance,
      };

      g.append('text')
        .attr('x', labelPos.x)
        .attr('y', labelPos.y)
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(d.trait);
    });

    // Draw data polygon
    const pathData = data.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = rScale(d.value);
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      };
    });

    const lineGenerator = d3
      .line<{ x: number; y: number }>()
      .x(d => d.x)
      .y(d => d.y);

    // Filled area
    if (pathData.length > 0 && pathData[0]) {
      g.append('path')
        .datum([...pathData, pathData[0]])
        .attr('d', lineGenerator)
        .attr('fill', '#60a5fa')
        .attr('fill-opacity', 0.3)
        .attr('stroke', '#60a5fa')
        .attr('stroke-width', 2);
    }

    // Data points
    pathData.forEach((point, i) => {
      g.append('circle')
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 4)
        .attr('fill', '#60a5fa')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).attr('r', 6);
          tooltip
            .style('opacity', 1)
            .html(`<strong>${data[i]!.trait}</strong><br/>Value: ${data[i]!.rawValue.toFixed(1)}`);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseleave', function() {
          d3.select(this).attr('r', 4);
          tooltip.style('opacity', 0);
        });
    });

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'radar-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#fff')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    return () => {
      tooltip.remove();
    };
  }, [traits, width, height]);

  return (
    <div style={{ background: 'rgba(0, 0, 0, 0.8)', padding: '10px', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '16px', textAlign: 'center' }}>
        Trait Profile
      </h3>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
