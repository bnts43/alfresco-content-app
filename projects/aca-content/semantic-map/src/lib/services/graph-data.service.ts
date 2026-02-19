import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  DocumentDetail,
  GraphEdge,
  GraphNode,
  SimilarDocument,
  Theme
} from '../models/graph.model';
import { SemanticMapApiService } from './semantic-map-api.service';

export interface GraphState {
  themes: Theme[];
  selectedThemeIds: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedDocument: DocumentDetail | null;
  similarDocuments: SimilarDocument[];
  loadingGraph: boolean;
  loadingThemes: boolean;
  loadingDetail: boolean;
  error: string | null;
}

const INITIAL_STATE: GraphState = {
  themes: [],
  selectedThemeIds: [],
  nodes: [],
  edges: [],
  selectedDocument: null,
  similarDocuments: [],
  loadingGraph: false,
  loadingThemes: false,
  loadingDetail: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class GraphDataService {

  private state$ = new BehaviorSubject<GraphState>(INITIAL_STATE);

  constructor(private api: SemanticMapApiService) {}

  getState(): Observable<GraphState> {
    return this.state$.asObservable();
  }

  get snapshot(): GraphState {
    return this.state$.value;
  }

  loadThemes(): void {
    this.patchState({ loadingThemes: true, error: null });

    this.api.getThemes().pipe(
      tap(themes => {
        const allIds = themes.map(t => t.id);
        this.patchState({
          themes,
          selectedThemeIds: allIds,
          loadingThemes: false
        });
        this.loadGraphData(allIds);
      }),
      catchError(err => {
        console.error(err);
        this.patchState({ loadingThemes: false, error: 'Failed to load themes' });
        return of(null);
      })
    ).subscribe();
  }

  setSelectedThemes(themeIds: string[]): void {
    this.patchState({
      selectedThemeIds: themeIds,
      selectedDocument: null,
      similarDocuments: []
    });
    this.loadGraphData(themeIds);
  }

  loadGraphData(themeIds?: string[]): void {
    const ids = themeIds ?? this.snapshot.selectedThemeIds;
    if (ids.length === 0) {
      this.patchState({ nodes: [], edges: [], loadingGraph: false });
      return;
    }

    this.patchState({ loadingGraph: true, error: null });

    forkJoin([
      this.api.getGraphData(ids, 0.65),
      this.api.recomputePositions(ids)
    ]).pipe(
      switchMap(([_graphData, _positions]) => {
        // After recompute, re-fetch to get updated positions
        return this.api.getGraphData(ids, 0.65);
      }),
      tap(graphData => {
        this.patchState({
          nodes: graphData.nodes,
          edges: graphData.edges,
          loadingGraph: false
        });
      }),
      catchError(err => {
        console.error(err);
        // Fallback: try just graph data without recompute
        return this.api.getGraphData(ids, 0.65).pipe(
          tap(graphData => {
            this.patchState({
              nodes: graphData.nodes,
              edges: graphData.edges,
              loadingGraph: false
            });
          }),
          catchError(innerErr => {
            console.error(innerErr);
            this.patchState({ loadingGraph: false, error: 'Failed to load graph data' });
            return of(null);
          })
        );
      })
    ).subscribe();
  }

  selectDocument(nodeId: string): void {
    if (!nodeId) {
      this.patchState({ selectedDocument: null, similarDocuments: [] });
      return;
    }

    this.patchState({ loadingDetail: true });

    forkJoin([
      this.api.getDocumentDetail(nodeId),
      this.api.getSimilarDocuments(nodeId, 10)
    ]).pipe(
      tap(([detail, similar]) => {
        this.patchState({
          selectedDocument: detail,
          similarDocuments: similar,
          loadingDetail: false
        });
      }),
      catchError(err => {
        console.error(err);
        this.patchState({ loadingDetail: false, error: 'Failed to load document details' });
        return of(null);
      })
    ).subscribe();
  }

  clearSelection(): void {
    this.patchState({ selectedDocument: null, similarDocuments: [] });
  }

  private patchState(partial: Partial<GraphState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }
}
