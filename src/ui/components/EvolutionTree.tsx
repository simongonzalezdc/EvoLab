import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { LineageNode } from '../../data/HistoryTracker';

interface EvolutionTreeProps {
  lineageData: Map<string, LineageNode>;
  width?: number;
  height?: number;
}

interface TreeNode {
  id: string;
  parentId: string | null;
  generation: number;
  isPlayerLineage: boolean;
  children: TreeNode[];
}

export const EvolutionTree: React.FC<EvolutionTreeProps> = ({
  lineageData,
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || lineageData.size === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Convert lineage map to tree structure
    const buildTree = (): TreeNode | null => {
      const nodes = Array.from(lineageData.values());
      const nodeMap = new Map<string, TreeNode>();

      // Create tree nodes
      nodes.forEach(node => {
        nodeMap.set(node.id, {
          id: node.id,
          parentId: node.parentId,
          generation: node.generation,
          isPlayerLineage: node.isPlayerLineage,
          children: [],
        });
      });

      // Build parent-child relationships
      let root: TreeNode | null = null;
      nodeMap.forEach(node => {
        if (node.parentId === null) {
          root = node;
        } else {
          const parent = nodeMap.get(node.parentId);
          if (parent) {
            parent.children.push(node);
          }
        }
      });

      return root;
    };

    const root = buildTree();
    if (!root) return;

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create hierarchy
    const hierarchy = d3.hierarchy(root, d => d.children);
    const treeLayout = d3.tree<TreeNode>().size([innerWidth, innerHeight]);
    const treeData = treeLayout(hierarchy);

    // Links
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', d => (d.target.data.isPlayerLineage ? '#60a5fa' : '#666'))
      .attr('stroke-width', d => (d.target.data.isPlayerLineage ? 2 : 1))
      .attr('d', d3.linkVertical<any, any>()
        .x(d => d.x)
        .y(d => d.y)
      );

    // Nodes
    const nodes = g
      .selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodes
      .append('circle')
      .attr('r', d => (d.data.isPlayerLineage ? 6 : 4))
      .attr('fill', d => (d.data.isPlayerLineage ? '#60a5fa' : '#4ade80'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('r', d.data.isPlayerLineage ? 8 : 6);
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>Generation ${d.data.generation}</strong><br/>
            ID: ${d.data.id.substring(0, 8)}...<br/>
            Type: ${d.data.isPlayerLineage ? 'Player Lineage' : 'AI'}
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).attr('r', d.data.isPlayerLineage ? 6 : 4);
        tooltip.style('opacity', 0);
      });

    // Generation labels (only for some nodes to avoid clutter)
    nodes
      .filter((d, i) => i % 5 === 0 || d.data.isPlayerLineage)
      .append('text')
      .attr('dy', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .text(d => `G${d.data.generation}`);

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tree-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#fff')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 150}, 20)`);

    legend
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', '#60a5fa')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    legend
      .append('text')
      .attr('x', 15)
      .attr('y', 4)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .text('Player Lineage');

    legend
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 25)
      .attr('r', 4)
      .attr('fill', '#4ade80')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    legend
      .append('text')
      .attr('x', 15)
      .attr('y', 29)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .text('AI Species');

    return () => {
      tooltip.remove();
    };
  }, [lineageData, width, height]);

  return (
    <div style={{ background: 'rgba(0, 0, 0, 0.8)', padding: '10px', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '16px' }}>Evolution Tree</h3>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
