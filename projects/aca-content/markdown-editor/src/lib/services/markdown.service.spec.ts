import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ContentApiService } from '@alfresco/aca-shared';
import { AlfrescoApiService, NodesApiService } from '@alfresco/adf-content-services';
import { MarkdownService } from './markdown.service';

describe('MarkdownService', () => {
  let service: MarkdownService;
  let httpMock: HttpTestingController;
  let contentApiSpy: jasmine.SpyObj<ContentApiService>;
  let apiServiceSpy: jasmine.SpyObj<AlfrescoApiService>;
  let nodesApiServiceSpy: jasmine.SpyObj<NodesApiService>;

  beforeEach(() => {
    contentApiSpy = jasmine.createSpyObj('ContentApiService', ['getContentUrl']);
    apiServiceSpy = jasmine.createSpyObj('AlfrescoApiService', ['getInstance']);
    nodesApiServiceSpy = jasmine.createSpyObj('NodesApiService', [], {
      nodeUpdated: { next: jasmine.createSpy('next') }
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MarkdownService,
        { provide: ContentApiService, useValue: contentApiSpy },
        { provide: AlfrescoApiService, useValue: apiServiceSpy },
        { provide: NodesApiService, useValue: nodesApiServiceSpy }
      ]
    });

    service = TestBed.inject(MarkdownService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchContent', () => {
    it('should fetch markdown content as text', () => {
      const nodeId = 'test-node-id';
      const mockUrl = '/api/content/test-node-id';
      const mockContent = '# Hello World\n\nThis is markdown.';

      contentApiSpy.getContentUrl.and.returnValue(mockUrl);

      service.fetchContent(nodeId).subscribe((content) => {
        expect(content).toBe(mockContent);
      });

      const req = httpMock.expectOne(mockUrl);
      expect(req.request.responseType).toBe('text');
      req.flush(mockContent);
    });

    it('should call ContentApiService.getContentUrl with correct params', () => {
      const nodeId = 'node-123';
      contentApiSpy.getContentUrl.and.returnValue('/api/content/node-123');

      service.fetchContent(nodeId).subscribe();

      httpMock.expectOne('/api/content/node-123').flush('');
      expect(contentApiSpy.getContentUrl).toHaveBeenCalledWith(nodeId, false);
    });
  });

  describe('saveContent', () => {
    it('should call NodesApi.updateNodeContent and emit nodeUpdated', (done) => {
      const nodeId = 'node-123';
      const content = '# Updated Content';
      const mockNode = { id: nodeId, name: 'test.md' };
      const mockResponse = { entry: mockNode };

      const mockNodesApi = {
        updateNodeContent: jasmine.createSpy('updateNodeContent').and.returnValue(Promise.resolve(mockResponse))
      };

      apiServiceSpy.getInstance.and.returnValue({} as any);
      (service as any)._nodesApi = mockNodesApi;

      service.saveContent(nodeId, content, false, 'test comment').subscribe((result) => {
        expect(result).toEqual(mockNode as any);
        expect(mockNodesApi.updateNodeContent).toHaveBeenCalledWith(nodeId, content, {
          majorVersion: false,
          comment: 'test comment'
        });
        expect(nodesApiServiceSpy.nodeUpdated.next).toHaveBeenCalledWith(mockNode);
        done();
      });
    });

    it('should pass majorVersion flag correctly', (done) => {
      const mockNodesApi = {
        updateNodeContent: jasmine.createSpy('updateNodeContent').and.returnValue(
          Promise.resolve({ entry: { id: '1', name: 'test.md' } })
        )
      };

      apiServiceSpy.getInstance.and.returnValue({} as any);
      (service as any)._nodesApi = mockNodesApi;

      service.saveContent('1', 'content', true, 'major update').subscribe(() => {
        expect(mockNodesApi.updateNodeContent).toHaveBeenCalledWith('1', 'content', {
          majorVersion: true,
          comment: 'major update'
        });
        done();
      });
    });
  });
});
