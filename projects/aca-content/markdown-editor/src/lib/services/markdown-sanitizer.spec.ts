import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '@alfresco/adf-core';
import { MarkdownSanitizerService, markdownSanitizer } from './markdown-sanitizer';

describe('MarkdownSanitizerService', () => {
  let service: MarkdownSanitizerService;
  let appConfigSpy: jasmine.SpyObj<AppConfigService>;

  beforeEach(() => {
    appConfigSpy = jasmine.createSpyObj('AppConfigService', ['get']);
    appConfigSpy.get.and.returnValue({
      USE_PROFILES: { html: true },
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      FORBID_TAGS: ['script', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    });

    TestBed.configureTestingModule({
      providers: [
        MarkdownSanitizerService,
        { provide: AppConfigService, useValue: appConfigSpy }
      ]
    });

    service = TestBed.inject(MarkdownSanitizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should read config from AppConfigService', () => {
    expect(appConfigSpy.get).toHaveBeenCalledWith('markdownEditor.sanitizer', jasmine.any(Object));
  });

  it('should sanitize plain HTML', () => {
    const result = service.sanitize('<p>Hello</p>');
    expect(result).toContain('Hello');
  });

  it('should strip script tags', () => {
    const result = service.sanitize('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('Hello');
  });

  it('should strip style tags', () => {
    const result = service.sanitize('<p>Hello</p><style>body{display:none}</style>');
    expect(result).not.toContain('<style>');
    expect(result).toContain('Hello');
  });

  it('should strip event handler attributes', () => {
    const result = service.sanitize('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });

  it('should strip onclick attributes', () => {
    const result = service.sanitize('<button onclick="alert(1)">Click</button>');
    expect(result).not.toContain('onclick');
  });

  it('should allow safe HTML elements', () => {
    const result = service.sanitize('<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>');
    expect(result).toContain('<h1>');
    expect(result).toContain('<p>');
    expect(result).toContain('<li>');
  });

  it('should allow target attribute on links', () => {
    const result = service.sanitize('<a href="https://example.com" target="_blank">Link</a>');
    expect(result).toContain('target');
  });

  it('should return empty string for empty input', () => {
    const result = service.sanitize('');
    expect(result).toBe('');
  });

  it('should use custom config when provided via AppConfigService', () => {
    appConfigSpy.get.and.returnValue({
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['div']
    });

    const customService = new MarkdownSanitizerService(appConfigSpy);
    const result = customService.sanitize('<div>Test</div><p>Keep</p>');
    expect(result).not.toContain('<div>');
    expect(result).toContain('<p>');
  });
});

describe('markdownSanitizer (deprecated function)', () => {
  it('should sanitize HTML and strip script tags', () => {
    const result = markdownSanitizer('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  it('should strip event handler attributes', () => {
    const result = markdownSanitizer('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });
});
