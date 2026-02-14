import {
  Component, ElementRef, ViewChild, Input, Output, EventEmitter,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy
} from '@angular/core';
import Graph from 'graphology';
import Sigma from 'sigma';
import { GraphNode, GraphEdge } from '../../models/graph.model';

@Component({
  selector: 'sem-sigma-graph',
  templateUrl: './sigma-graph.component.html',
  styleUrls: ['./sigma-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigmaGraphComponent implements AfterViewInit, OnDestroy, OnChanges {

  @ViewChild('graphContainer', { static: true }) container!: ElementRef<HTMLDivElement>;

  @Input() nodes: GraphNode[] = [];
  @Input() edges: GraphEdge[] = [];
  @Input() selectedNodeId: string | null = null;

  @Output() nodeClicked = new EventEmitter<string>();
  @Output() nodeHovered = new EventEmitter<string | null>();

  private sigma: Sigma | null = null;
  private graph: Graph | null = null;
  private hoveredNode: string | null = null;

  ngAfterViewInit(): void {
    this.initGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['nodes'] || changes['edges']) && this.graph) {
      this.updateGraphData();
    }
    if (changes['selectedNodeId'] && this.sigma) {
      this.sigma.refresh();
    }
  }

  ngOnDestroy(): void {
    this.sigma?.kill();
    this.sigma = null;
    this.graph = null;
  }

  private initGraph(): void {
    this.graph = new Graph();
    this.updateGraphData();

    this.sigma = new Sigma(this.graph, this.container.nativeElement, {
      defaultNodeColor: '#6366f1',
      defaultEdgeColor: '#e2e8f0',
      labelRenderedSizeThreshold: 8,
      labelFont: 'Inter, sans-serif',
      labelSize: 12,
      edgeReducer: (edge, data) => {
        const res = { ...data };
        if (this.hoveredNode) {
          const src = this.graph!.source(edge);
          const tgt = this.graph!.target(edge);
          if (src !== this.hoveredNode && tgt !== this.hoveredNode) {
            res.hidden = true;
          }
        }
        if (this.selectedNodeId) {
          const src = this.graph!.source(edge);
          const tgt = this.graph!.target(edge);
          if (src !== this.selectedNodeId && tgt !== this.selectedNodeId) {
            res.hidden = true;
          }
        }
        return res;
      },
      nodeReducer: (node, data) => {
        const res = { ...data };
        if (this.hoveredNode && this.hoveredNode !== node) {
          const neighbors = this.graph!.neighbors(this.hoveredNode);
          if (!neighbors.includes(node)) {
            res.color = '#e2e8f0';
            res.label = '';
          }
        }
        if (this.selectedNodeId === node) {
          res.highlighted = true;
        }
        return res;
      }
    });

    this.sigma.on('clickNode', ({ node }) => {
      this.nodeClicked.emit(node);
    });

    this.sigma.on('enterNode', ({ node }) => {
      this.hoveredNode = node;
      this.nodeHovered.emit(node);
      this.sigma!.refresh();
    });

    this.sigma.on('leaveNode', () => {
      this.hoveredNode = null;
      this.nodeHovered.emit(null);
      this.sigma!.refresh();
    });

    this.sigma.on('clickStage', () => {
      this.nodeClicked.emit('');
    });
  }

  private updateGraphData(): void {
    if (!this.graph) return;

    this.graph.clear();

    for (const node of this.nodes) {
      this.graph.addNode(node.id, {
        x: node.x,
        y: node.y,
        size: node.size || 6,
        color: node.color || '#6366f1',
        label: node.label
      });
    }

    for (const edge of this.edges) {
      const edgeKey = `${edge.source}-${edge.target}`;
      if (!this.graph.hasEdge(edgeKey) && this.graph.hasNode(edge.source) && this.graph.hasNode(edge.target)) {
        this.graph.addEdgeWithKey(edgeKey, edge.source, edge.target, {
          weight: edge.weight,
          size: Math.max(0.5, edge.weight * 3)
        });
      }
    }
  }

  zoomToFit(): void {
    if (this.sigma) {
      const camera = this.sigma.getCamera();
      camera.animatedReset({ duration: 300 });
    }
  }

  zoomIn(): void {
    if (this.sigma) {
      const camera = this.sigma.getCamera();
      camera.animatedZoom({ duration: 200 });
    }
  }

  zoomOut(): void {
    if (this.sigma) {
      const camera = this.sigma.getCamera();
      camera.animatedUnzoom({ duration: 200 });
    }
  }
}
