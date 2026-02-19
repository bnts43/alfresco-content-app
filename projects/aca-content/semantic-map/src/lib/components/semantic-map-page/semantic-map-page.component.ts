import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentDetail, GraphEdge, GraphNode, SimilarDocument, Theme } from '../../models/graph.model';
import { GraphDataService, GraphState } from '../../services/graph-data.service';
import { CommonModule } from '@angular/common';
import { DocumentDetailPanelComponent } from '../document-detail-panel/document-detail-panel.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SigmaGraphComponent } from '../sigma-graph/sigma-graph.component';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';

@Component({
  selector: 'sem-semantic-map-page',
  templateUrl: './semantic-map-page.component.html',
  imports: [CommonModule, DocumentDetailPanelComponent, MatProgressSpinnerModule, SigmaGraphComponent, ThemeSelectorComponent],
  styleUrls: ['./semantic-map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class SemanticMapPageComponent implements OnInit, OnDestroy {

  state$!: Observable<GraphState>;
  themes$!: Observable<Theme[]>;
  selectedThemeIds$!: Observable<string[]>;
  nodes$!: Observable<GraphNode[]>;
  edges$!: Observable<GraphEdge[]>;
  selectedDocument$!: Observable<DocumentDetail | null>;
  similarDocuments$!: Observable<SimilarDocument[]>;
  loadingGraph$!: Observable<boolean>;
  loadingThemes$!: Observable<boolean>;
  loadingDetail$!: Observable<boolean>;
  hasSelection$!: Observable<boolean>;

  selectedNodeId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private graphDataService: GraphDataService) {}

  ngOnInit(): void {
    this.state$ = this.graphDataService.getState();

    this.themes$ = this.state$.pipe(map(s => s.themes));
    this.selectedThemeIds$ = this.state$.pipe(map(s => s.selectedThemeIds));
    this.nodes$ = this.state$.pipe(map(s => s.nodes));
    this.edges$ = this.state$.pipe(map(s => s.edges));
    this.selectedDocument$ = this.state$.pipe(map(s => s.selectedDocument));
    this.similarDocuments$ = this.state$.pipe(map(s => s.similarDocuments));
    this.loadingGraph$ = this.state$.pipe(map(s => s.loadingGraph));
    this.loadingThemes$ = this.state$.pipe(map(s => s.loadingThemes));
    this.loadingDetail$ = this.state$.pipe(map(s => s.loadingDetail));
    this.hasSelection$ = this.state$.pipe(map(s => s.selectedDocument !== null));

    this.graphDataService.loadThemes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onThemeSelectionChanged(themeIds: string[]): void {
    this.graphDataService.setSelectedThemes(themeIds);
  }

  onNodeClicked(nodeId: string): void {
    if (!nodeId) {
      this.selectedNodeId = null;
      this.graphDataService.clearSelection();
      return;
    }
    // Find the alfresco node ID from the graph node
    const state = this.graphDataService.snapshot;
    const node = state.nodes.find(n => n.id === nodeId);
    if (node) {
      this.selectedNodeId = nodeId;
      this.graphDataService.selectDocument(node.alfrescoNodeId);
    }
  }

  onNodeHovered(_nodeId: string | null): void {
    // Could add hover preview logic here
  }

  onDocumentSelected(alfrescoNodeId: string): void {
    const state = this.graphDataService.snapshot;
    const node = state.nodes.find(n => n.alfrescoNodeId === alfrescoNodeId);
    if (node) {
      this.selectedNodeId = node.id;
    }
    this.graphDataService.selectDocument(alfrescoNodeId);
  }

  onPanelClosed(): void {
    this.selectedNodeId = null;
    this.graphDataService.clearSelection();
  }

  onOpenInAlfresco(alfrescoNodeId: string): void {
    window.open(`/#/personal-files/${alfrescoNodeId}`, '_blank');
  }
}
