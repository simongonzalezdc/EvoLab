import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { PopulationDataPoint } from '../../data/HistoryTracker';

interface PopulationGraphProps {
  data: PopulationDataPoint[];
  width?: number;
  height?: number;
}

export const PopulationGraph: React.FC<PopulationGraphProps> = ({
  data,
  width = 600,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.generation) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.total) || 100])
      .nice()
      .range([innerHeight, 0]);

    // Line generators
    const lineTotal = d3
      .line<PopulationDataPoint>()
      .x(d => xScale(d.generation))
      .y(d => yScale(d.total))
      .curve(d3.curveMonotoneX);

    const lineHerbivores = d3
      .line<PopulationDataPoint>()
      .x(d => xScale(d.generation))
      .y(d => yScale(d.herbivores))
      .curve(d3.curveMonotoneX);

    const lineCarnivores = d3
      .line<PopulationDataPoint>()
      .x(d => xScale(d.generation))
      .y(d => yScale(d.carnivores))
      .curve(d3.curveMonotoneX);

    const lineOmnivores = d3
      .line<PopulationDataPoint>()
      .x(d => xScale(d.generation))
      .y(d => yScale(d.omnivores))
      .curve(d3.curveMonotoneX);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .text('Generation');

    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .text('Population');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Draw lines
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4ade80')
      .attr('stroke-width', 2)
      .attr('d', lineHerbivores);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('d', lineCarnivores);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 2)
      .attr('d', lineOmnivores);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 3)
      .attr('d', lineTotal);

    // Legend
    const legend = g
      .append('g')
      .attr('transform', `translate(${innerWidth + 10}, 0)`);

    const legendData = [
      { label: 'Total', color: '#60a5fa' },
      { label: 'Herbivores', color: '#4ade80' },
      { label: 'Carnivores', color: '#ef4444' },
      { label: 'Omnivores', color: '#fbbf24' },
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('line')
        .attr('x1', 0)
        .attr('x2', 30)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', item.color)
        .attr('stroke-width', 2);

      legendRow
        .append('text')
        .attr('x', 35)
        .attr('y', 4)
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .text(item.label);
    });

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'population-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#fff')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Add interactive overlay
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const generation = Math.round(xScale.invert(mouseX));
        const dataPoint = data.find(d => d.generation === generation);

        if (dataPoint) {
          tooltip
            .style('opacity', 1)
            .html(`
              <strong>Generation ${dataPoint.generation}</strong><br/>
              Total: ${dataPoint.total}<br/>
              Herbivores: ${dataPoint.herbivores}<br/>
              Carnivores: ${dataPoint.carnivores}<br/>
              Omnivores: ${dataPoint.omnivores}
            `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        }
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

  return (
    <div style={{ background: 'rgba(0, 0, 0, 0.8)', padding: '10px', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '16px' }}>Population Over Time</h3>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
