import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { AlfrescoApiClient, RequestOptions } from '@alfresco/js-api';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentDetail, GraphData, ProcessingJob, SimilarDocument, Theme } from '../models/graph.model';

@Injectable({
  providedIn: 'root'
})
export class SemanticMapApiService {
  private readonly baseUrl = '/api/semantic-map/v1';
  private alfrescoApiHttp: AlfrescoApiClient;

  constructor(api: AlfrescoApiService) {
    this.alfrescoApiHttp = api.getInstance().contentClient;
  }

  getGraphData(themeIds?: string[], minSimilarity?: number): Observable<GraphData> {
    const queryParams: Record<string, string> = {};
    if (themeIds && themeIds.length > 0) {
      queryParams['themeIds'] = themeIds.join(',');
    }
    if (minSimilarity !== undefined) {
      queryParams['minSimilarity'] = minSimilarity.toString();
    }
    return from(this.alfrescoApiHttp.get<GraphData>({ path: `${this.baseUrl}/graph`, queryParams }));
  }

  getThemes(): Observable<Theme[]> {
    const reqs: RequestOptions = {
      path: `${this.baseUrl}/themes`
    };
    return from(this.alfrescoApiHttp.get<{ themes: Theme[] }>(reqs)).pipe(map((response) => response.themes));
  }

  getDocumentDetail(nodeId: string): Observable<DocumentDetail> {
    return from(this.alfrescoApiHttp.get<DocumentDetail>({ path: `${this.baseUrl}/documents/${nodeId}` }));
  }

  getSimilarDocuments(nodeId: string, limit: number = 10): Observable<SimilarDocument[]> {
    return from(
      this.alfrescoApiHttp.get<{ documents: SimilarDocument[] }>({
        path: `${this.baseUrl}/documents/${nodeId}/similar`,
        queryParams: { limit: limit.toString() }
      })
    ).pipe(map((r) => r.documents));
  }

  triggerProcessing(jobType: string = 'FULL'): Observable<{ jobId: string }> {
    return from(
      this.alfrescoApiHttp.post<{ jobId: string }>({
        path: `${this.baseUrl}/processing/jobs`,
        bodyParam: { jobType }
      })
    );
  }

  getJobStatus(jobId: string): Observable<ProcessingJob> {
    return from(this.alfrescoApiHttp.get<ProcessingJob>({ path: `${this.baseUrl}/processing/jobs/${jobId}` }));
  }

  recomputePositions(themeIds?: string[]): Observable<{ positionsUpdated: number }> {
    return from(
      this.alfrescoApiHttp.post<{ positionsUpdated: number }>({
        path: `${this.baseUrl}/graph/recompute-positions`,
        bodyParam: { themeIds: themeIds ? themeIds.join(',') : '' }
      })
    );
  }
}
