import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { MarkdownEditorComponent } from './markdown-editor.component';

describe('MarkdownEditorComponent', () => {
  let fixture: ComponentFixture<MarkdownEditorComponent>;
  let component: MarkdownEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MarkdownEditorComponent, NoopTranslateModule],
      providers: [provideNoopAnimations()]
    });

    fixture = TestBed.createComponent(MarkdownEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty content', () => {
    expect(component.content).toBe('');
  });

  it('should show preview by default', () => {
    expect(component.showPreview).toBe(true);
  });

  describe('contentChange', () => {
    it('should emit contentChange when content changes', () => {
      spyOn(component.contentChange, 'emit');
      component.onContentChange('new content');
      expect(component.contentChange.emit).toHaveBeenCalledWith('new content');
    });
  });

  describe('insertMarkdown', () => {
    it('should append prefix and suffix to content', () => {
      component.content = 'Hello';
      spyOn(component.contentChange, 'emit');

      component.insertMarkdown('**', '**');

      expect(component.content).toBe('Hello****');
      expect(component.contentChange.emit).toHaveBeenCalledWith('Hello****');
    });

    it('should handle prefix only', () => {
      component.content = '';
      component.insertMarkdown('# ');

      expect(component.content).toBe('# ');
    });

    it('should handle empty content', () => {
      component.content = '';
      component.insertMarkdown('**', '**');

      expect(component.content).toBe('****');
    });
  });

  describe('onKeydown', () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
      textarea = document.createElement('textarea');
      textarea.value = 'Hello World';
      document.body.appendChild(textarea);
    });

    afterEach(() => {
      document.body.removeChild(textarea);
    });

    it('should handle Ctrl+B for bold', () => {
      component.content = 'Hello World';
      textarea.value = component.content;
      textarea.selectionStart = 0;
      textarea.selectionEnd = 5;

      const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
      spyOn(event, 'preventDefault');

      component.onKeydown(event, textarea);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.content).toContain('**');
    });

    it('should handle Ctrl+I for italic', () => {
      component.content = 'Hello World';
      textarea.value = component.content;
      textarea.selectionStart = 0;
      textarea.selectionEnd = 5;

      const event = new KeyboardEvent('keydown', { key: 'i', ctrlKey: true });
      spyOn(event, 'preventDefault');

      component.onKeydown(event, textarea);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.content).toContain('*');
    });

    it('should handle Ctrl+K for link', () => {
      component.content = 'Hello World';
      textarea.value = component.content;
      textarea.selectionStart = 0;
      textarea.selectionEnd = 5;

      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      spyOn(event, 'preventDefault');

      component.onKeydown(event, textarea);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.content).toContain('](url)');
    });

    it('should handle Tab key for indentation', () => {
      component.content = 'Hello World';
      textarea.value = component.content;
      textarea.selectionStart = 5;
      textarea.selectionEnd = 5;

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      spyOn(event, 'preventDefault');

      component.onKeydown(event, textarea);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.content).toBe('Hello  World');
    });

    it('should insert default text when no selection for bold', () => {
      component.content = 'Hello';
      textarea.value = component.content;
      textarea.selectionStart = 5;
      textarea.selectionEnd = 5;

      const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
      component.onKeydown(event, textarea);

      expect(component.content).toContain('**text**');
    });
  });

  describe('showPreview toggle', () => {
    it('should toggle showPreview', () => {
      expect(component.showPreview).toBe(true);
      component.showPreview = false;
      expect(component.showPreview).toBe(false);
    });
  });
});
