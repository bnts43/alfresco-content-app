import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentApiService } from '@alfresco/aca-shared';
import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Node, NodesApi } from '@alfresco/js-api';

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private _nodesApi: NodesApi;

  private get nodesApi(): NodesApi {
    this._nodesApi = this._nodesApi ?? new NodesApi(this.apiService.getInstance());
    return this._nodesApi;
  }

  constructor(
    private contentApi: ContentApiService,
    private apiService: AlfrescoApiService,
    private http: HttpClient
  ) {}

  fetchContent(nodeId: string): Observable<string> {
    const url = this.contentApi.getContentUrl(nodeId, false);
    return this.http.get(url, { responseType: 'text' });
  }

  saveContent(nodeId: string, content: string, majorVersion: boolean, comment: string): Observable<Node> {
    return from(
      this.nodesApi.updateNodeContent(nodeId, content, {
        majorVersion,
        comment
      })
    ).pipe(
      map((entry) => {
        const node = entry.entry;
        return node;
      })
    );
  }
}
