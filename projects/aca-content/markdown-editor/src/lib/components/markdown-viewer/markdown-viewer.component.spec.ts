import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError, Subject } from 'rxjs';
import { Node } from '@alfresco/js-api';
import { SimpleChange } from '@angular/core';
import { MarkdownViewerComponent } from './markdown-viewer.component';
import { MarkdownService } from '../../services/markdown.service';
import { MarkdownSanitizerService } from '../../services/markdown-sanitizer';
import { SaveVersionDialogResult } from '../save-version-dialog/save-version-dialog.component';

describe('MarkdownViewerComponent', () => {
  let fixture: ComponentFixture<MarkdownViewerComponent>;
  let component: MarkdownViewerComponent;
  let markdownServiceSpy: jasmine.SpyObj<MarkdownService>;
  let sanitizerServiceSpy: jasmine.SpyObj<MarkdownSanitizerService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockNode: Node = {
    id: 'node-123',
    name: 'test.md',
    allowableOperations: ['update'],
    isFile: true,
    isFolder: false,
    nodeType: 'cm:content',
    modifiedAt: new Date(),
    createdAt: new Date(),
    createdByUser: { id: 'user1', displayName: 'User 1' },
    modifiedByUser: { id: 'user1', displayName: 'User 1' }
  } as Node;

  beforeEach(() => {
    markdownServiceSpy = jasmine.createSpyObj('MarkdownService', ['fetchContent', 'saveContent']);
    sanitizerServiceSpy = jasmine.createSpyObj('MarkdownSanitizerService', ['sanitize']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    sanitizerServiceSpy.sanitize.and.callFake((value: string) => value);
    translateServiceSpy.instant.and.callFake((key: string) => key);

    TestBed.configureTestingModule({
      imports: [MarkdownViewerComponent, NoopTranslateModule],
      providers: [
        provideNoopAnimations(),
        { provide: MarkdownService, useValue: markdownServiceSpy },
        { provide: MarkdownSanitizerService, useValue: sanitizerServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(MarkdownViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.editMode).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.saving).toBe(false);
    expect(component.canEdit).toBe(false);
    expect(component.markdownContent).toBeNull();
  });

  describe('ngOnChanges', () => {
    it('should load content when node changes', () => {
      markdownServiceSpy.fetchContent.and.returnValue(of('# Hello'));

      component.node = mockNode;
      component.ngOnChanges({
        node: new SimpleChange(null, mockNode, true)
      });

      expect(markdownServiceSpy.fetchContent).toHaveBeenCalledWith('node-123');
    });

    it('should set canEdit based on allowableOperations', () => {
      markdownServiceSpy.fetchContent.and.returnValue(of(''));

      component.node = mockNode;
      component.ngOnChanges({
        node: new SimpleChange(null, mockNode, true)
      });

      expect(component.canEdit).toBe(true);
    });

    it('should set canEdit to false when no update permission', () => {
      markdownServiceSpy.fetchContent.and.returnValue(of(''));

      const readOnlyNode = { ...mockNode, allowableOperations: ['read'] } as Node;
      component.node = readOnlyNode;
      component.ngOnChanges({
        node: new SimpleChange(null, readOnlyNode, true)
      });

      expect(component.canEdit).toBe(false);
    });

    it('should sanitize content after loading', () => {
      markdownServiceSpy.fetchContent.and.returnValue(of('# Test <script>alert(1)</script>'));
      sanitizerServiceSpy.sanitize.and.returnValue('# Test ');

      component.node = mockNode;
      component.ngOnChanges({
        node: new SimpleChange(null, mockNode, true)
      });

      expect(sanitizerServiceSpy.sanitize).toHaveBeenCalledWith('# Test <script>alert(1)</script>');
      expect(component.markdownContent).toBe('# Test ');
    });

    it('should handle fetch error gracefully', () => {
      markdownServiceSpy.fetchContent.and.returnValue(throwError(() => new Error('Network error')));

      component.node = mockNode;
      component.ngOnChanges({
        node: new SimpleChange(null, mockNode, true)
      });

      expect(component.markdownContent).toBe('');
      expect(component.loading).toBe(false);
    });

    it('should not load content when node has no id', () => {
      component.node = { ...mockNode, id: undefined } as any;
      component.ngOnChanges({
        node: new SimpleChange(null, component.node, true)
      });

      expect(markdownServiceSpy.fetchContent).not.toHaveBeenCalled();
    });
  });

  describe('enterEditMode', () => {
    it('should set editMode to true', () => {
      component.markdownContent = '# Hello';
      component.enterEditMode();

      expect(component.editMode).toBe(true);
      expect(component.editContent).toBe('# Hello');
      expect(component.isDirty).toBe(false);
    });

    it('should use empty string when markdownContent is null', () => {
      component.markdownContent = null;
      component.enterEditMode();

      expect(component.editContent).toBe('');
    });
  });

  describe('onEditorContentChange', () => {
    it('should update editContent and set isDirty', () => {
      component.onEditorContentChange('updated content');

      expect(component.editContent).toBe('updated content');
      expect(component.isDirty).toBe(true);
    });
  });

  describe('onSave', () => {
    it('should open save version dialog', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(undefined));
      dialogSpy.open.and.returnValue(dialogRefSpy);

      component.onSave();

      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should save content when dialog returns result', fakeAsync(() => {
      const dialogResult: SaveVersionDialogResult = {
        majorVersion: false,
        comment: 'test save'
      };
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(dialogResult));
      dialogSpy.open.and.returnValue(dialogRefSpy);

      const savedNode = { ...mockNode } as Node;
      markdownServiceSpy.saveContent.and.returnValue(of(savedNode));

      component.node = mockNode;
      component.editContent = '# Updated';
      component.onSave();
      tick();

      expect(markdownServiceSpy.saveContent).toHaveBeenCalledWith('node-123', '# Updated', false, 'test save');
      expect(component.editMode).toBe(false);
      expect(component.saving).toBe(false);
      expect(component.isDirty).toBe(false);
    }));

    it('should not save when dialog is cancelled', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(undefined));
      dialogSpy.open.and.returnValue(dialogRefSpy);

      component.onSave();

      expect(markdownServiceSpy.saveContent).not.toHaveBeenCalled();
    });

    it('should show error snackbar on save failure', fakeAsync(() => {
      const dialogResult: SaveVersionDialogResult = {
        majorVersion: false,
        comment: 'test save'
      };
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(dialogResult));
      dialogSpy.open.and.returnValue(dialogRefSpy);

      markdownServiceSpy.saveContent.and.returnValue(throwError(() => new Error('Save failed')));

      component.node = mockNode;
      component.editContent = '# Updated';
      component.onSave();
      tick();

      expect(component.saving).toBe(false);
      expect(snackBarSpy.open).toHaveBeenCalled();
    }));
  });

  describe('onCancel', () => {
    it('should exit edit mode when not dirty', () => {
      component.editMode = true;
      component.isDirty = false;

      component.onCancel();

      expect(component.editMode).toBe(false);
    });

    it('should prompt confirmation when dirty', () => {
      component.editMode = true;
      component.isDirty = true;
      spyOn(window, 'confirm').and.returnValue(true);

      component.onCancel();

      expect(window.confirm).toHaveBeenCalled();
      expect(component.editMode).toBe(false);
    });

    it('should stay in edit mode when user cancels confirmation', () => {
      component.editMode = true;
      component.isDirty = true;
      spyOn(window, 'confirm').and.returnValue(false);

      component.onCancel();

      expect(component.editMode).toBe(true);
    });
  });
});
