import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphData, Theme, DocumentDetail, SimilarDocument, ProcessingJob } from '../models/graph.model';

@Injectable({
  providedIn: 'root'
})
export class SemanticMapApiService {

  private readonly baseUrl = '/alfresco/service/api/semantic-map/v1';

  constructor(private http: HttpClient) {}

  getGraphData(themeIds?: string[], minSimilarity?: number): Observable<GraphData> {
    let params = new HttpParams();
    if (themeIds && themeIds.length > 0) {
      params = params.set('themeIds', themeIds.join(','));
    }
    if (minSimilarity !== undefined) {
      params = params.set('minSimilarity', minSimilarity.toString());
    }
    return this.http.get<GraphData>(`${this.baseUrl}/graph`, { params });
  }

  getThemes(): Observable<Theme[]> {
    return this.http.get<{ themes: Theme[] }>(`${this.baseUrl}/themes`).pipe(
      map(response => response.themes)
    );
  }

  getDocumentDetail(nodeId: string): Observable<DocumentDetail> {
    return this.http.get<DocumentDetail>(`${this.baseUrl}/documents/${nodeId}`);
  }

  getSimilarDocuments(nodeId: string, limit: number = 10): Observable<SimilarDocument[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ documents: SimilarDocument[] }>(
      `${this.baseUrl}/documents/${nodeId}/similar`, { params }
    ).pipe(map(r => r.documents));
  }

  triggerProcessing(jobType: string = 'FULL'): Observable<{ jobId: string }> {
    return this.http.post<{ jobId: string }>(`${this.baseUrl}/processing/jobs`, { jobType });
  }

  getJobStatus(jobId: string): Observable<ProcessingJob> {
    return this.http.get<ProcessingJob>(`${this.baseUrl}/processing/jobs/${jobId}`);
  }

  recomputePositions(themeIds?: string[]): Observable<{ positionsUpdated: number }> {
    return this.http.post<{ positionsUpdated: number }>(
      `${this.baseUrl}/graph/recompute-positions`,
      { themeIds: themeIds ? themeIds.join(',') : '' }
    );
  }
}
