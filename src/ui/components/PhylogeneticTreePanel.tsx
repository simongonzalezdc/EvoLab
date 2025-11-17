// Phylogenetic tree visualization panel

import React, { useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';
import * as d3 from 'd3';
import type { Species } from '../../types/entities';

interface PhylogeneticNode {
  speciesId: string;
  parentSpeciesId: string | null;
  divergenceTime: number;
  children: PhylogeneticNode[];
  isExtinct: boolean;
}

interface Props {
  phylogeneticTree: PhylogeneticNode[];
  species: Species[];
  onClose: () => void;
}

export const PhylogeneticTreePanel: React.FC<Props> = ({ phylogeneticTree, species, onClose }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!svgRef.current || phylogeneticTree.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 800;
    const height = 600;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Convert tree to D3 hierarchy
    if (phylogeneticTree.length === 0 || !phylogeneticTree[0]) return;
    const root = convertToD3Hierarchy(phylogeneticTree[0]);

    // Create tree layout
    const treeLayout = d3.tree<HierarchyNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const treeData = treeLayout(d3.hierarchy(root));

    // Draw links (branches)
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, any>()
        .x((d: any) => d.y)
        .y((d: any) => d.x)
      )
      .style('fill', 'none')
      .style('stroke', (d: any) => {
        const node = d.target.data as HierarchyNode;
        return node.isExtinct ? '#666' : '#aaa';
      })
      .style('stroke-width', 2)
      .style('stroke-dasharray', (d: any) => {
        const node = d.target.data as HierarchyNode;
        return node.isExtinct ? '5,5' : 'none';
      });

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    // Node circles
    nodes
      .append('circle')
      .attr('r', 6)
      .style('fill', (d: any) => {
        const node = d.data as HierarchyNode;
        const spec = species.find(s => s.id === node.speciesId);
        return spec ? `#${spec.color.toString(16).padStart(6, '0')}` : '#999';
      })
      .style('stroke', (d: any) => {
        const node = d.data as HierarchyNode;
        return node.isExtinct ? '#666' : '#333';
      })
      .style('stroke-width', 2)
      .style('opacity', (d: any) => {
        const node = d.data as HierarchyNode;
        return node.isExtinct ? 0.4 : 1;
      });

    // Node labels
    nodes
      .append('text')
      .attr('dx', (d: any) => d.children ? -10 : 10)
      .attr('dy', 4)
      .style('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .style('font-size', '12px')
      .style('font-family', 'monospace')
      .style('fill', (d: any) => {
        const node = d.data as HierarchyNode;
        return node.isExtinct ? '#666' : '#fff';
      })
      .text((d: any) => {
        const node = d.data as HierarchyNode;
        const spec = species.find(s => s.id === node.speciesId);
        return spec ? `${spec.name} (${spec.population})` : node.speciesId;
      });

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .text('Phylogenetic Tree');

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${width - 100}, 40)`);

    legend
      .append('circle')
      .attr('r', 4)
      .attr('cx', 0)
      .attr('cy', 0)
      .style('fill', '#4caf50');

    legend
      .append('text')
      .attr('x', 10)
      .attr('y', 4)
      .style('font-size', '11px')
      .style('fill', '#fff')
      .text('Living');

    legend
      .append('circle')
      .attr('r', 4)
      .attr('cx', 0)
      .attr('cy', 20)
      .style('fill', '#666')
      .style('opacity', 0.4);

    legend
      .append('text')
      .attr('x', 10)
      .attr('y', 24)
      .style('font-size', '11px')
      .style('fill', '#fff')
      .text('Extinct');

  }, [phylogeneticTree, species]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phylogenetic-title"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        border: '2px solid #4caf50',
        borderRadius: '8px',
        padding: '20px',
        zIndex: 1000,
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
      }}
    >
      <FocusLock returnFocus>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 id="phylogenetic-title" style={{ color: '#4caf50', margin: 0 }}>Phylogenetic Tree</h2>
        <button
          onClick={onClose}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg ref={svgRef} />
      </div>

      <div style={{ marginTop: '20px', color: '#aaa', fontSize: '12px' }}>
        <p>
          This tree shows the evolutionary relationships between species. Each node represents a
          species, with branches showing ancestry. Living species are shown in color, while extinct
          species are greyed out with dashed lines.
        </p>
        <p>
          Numbers in parentheses show current population size.
        </p>
      </div>
      </FocusLock>
    </div>
  );
};

// Helper types and functions
interface HierarchyNode {
  speciesId: string;
  parentSpeciesId: string | null;
  children: HierarchyNode[];
  isExtinct: boolean;
}

function convertToD3Hierarchy(node: PhylogeneticNode): HierarchyNode {
  return {
    speciesId: node.speciesId,
    parentSpeciesId: node.parentSpeciesId,
    children: node.children.map(convertToD3Hierarchy),
    isExtinct: node.isExtinct,
  };
}
