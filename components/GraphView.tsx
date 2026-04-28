'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const nodes = [
  { id: 'alex', label: 'Олександр', type: 'person', x: 0, y: 0 },
  { id: 'nexus', label: 'AI Nexus', type: 'project', x: 120, y: -60 },
  { id: 'assistant', label: 'AI-assistant', type: 'idea', x: 180, y: 40 },
  { id: 'oleg', label: 'Олег Петренко', type: 'person', x: -100, y: -80 },
  { id: 'aws', label: 'AWS Credit', type: 'opportunity', x: -60, y: 100 },
  { id: 'investors', label: 'Investors', type: 'opportunity', x: 60, y: 120 },
];

const links = [
  { source: 'alex', target: 'nexus', type: 'work', label: 'Founder' },
  { source: 'nexus', target: 'assistant', type: 'sub', label: 'contains' },
  { source: 'oleg', target: 'nexus', type: 'work', label: 'CFO' },
  { source: 'aws', target: 'nexus', type: 'finance', label: 'funded' },
  { source: 'investors', target: 'nexus', type: 'finance', label: 'invested' },
];

const typeColors: Record<string, string> = {
  person: '#A855F7',
  project: '#3B82F6',
  idea: '#F59E0B',
  opportunity: '#34C779',
};

const relColors: Record<string, string> = {
  work: '#3B82F6',
  finance: '#34C779',
  sub: '#F59E0B',
  owner: '#F59E0B',
  connected: '#A855F7',
  needs: '#EF4444',
};

export default function GraphView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 220;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Links
    const linkSel = g.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', (d) => {
        const s = nodes.find(n => n.id === d.source)!;
        return s.x;
      })
      .attr('y1', (d) => {
        const s = nodes.find(n => n.id === d.source)!;
        return s.y;
      })
      .attr('x2', (d) => {
        const t = nodes.find(n => n.id === d.target)!;
        return t.x;
      })
      .attr('y2', (d) => {
        const t = nodes.find(n => n.id === d.target)!;
        return t.y;
      })
      .attr('stroke', (d) => relColors[d.type] || '#8B949E')
      .attr('stroke-width', 1.5)
      .attr('class', 'graph-link');

    // Link labels
    g.selectAll('text.link-label')
      .data(links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('x', (d) => {
        const s = nodes.find(n => n.id === d.source)!;
        const t = nodes.find(n => n.id === d.target)!;
        return (s.x + t.x) / 2;
      })
      .attr('y', (d) => {
        const s = nodes.find(n => n.id === d.source)!;
        const t = nodes.find(n => n.id === d.target)!;
        return (s.y + t.y) / 2 - 5;
      })
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => relColors[d.type] || '#8B949E')
      .attr('font-size', 9)
      .attr('opacity', 0.7)
      .text((d) => d.label);

    // Node groups
    const node = g.selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'graph-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // Node circles
    node.append('circle')
      .attr('r', (d) => d.type === 'project' ? 22 : 18)
      .attr('fill', (d) => `${typeColors[d.type]}22`)
      .attr('stroke', (d) => typeColors[d.type])
      .attr('stroke-width', 2);

    // Node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.type === 'project' ? 36 : 30)
      .attr('fill', '#F0F6FC')
      .attr('font-size', 11)
      .attr('font-weight', '500')
      .text((d) => d.label);

    // Initial transform
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));

    return () => { svg.selectAll('*').remove(); };
  }, []);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network size={15} style={{ color: '#A855F7' }} />
          <h2 className="font-semibold text-sm">Граф зв&apos;язків</h2>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <ZoomIn size={14} />
          </button>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <ZoomOut size={14} />
          </button>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', height: 220 }}>
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {[
          { label: 'Працюють разом', color: '#3B82F6' },
          { label: 'Founder/Owner', color: '#F59E0B' },
          { label: "Зв'язані", color: '#A855F7' },
          { label: 'Фінанси', color: '#34C779' },
          { label: 'Потребують', color: '#EF4444' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
