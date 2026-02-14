import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';

@Component({
  selector: 'aca-markdown-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MarkdownModule
  ],
  providers: [
    provideMarkdown()
  ],
  template: `
    <div class="aca-markdown-editor">
      <mat-toolbar class="aca-markdown-editor__toolbar">
        <button mat-icon-button (click)="insertMarkdown('**', '**')" matTooltip="Bold (Ctrl+B)">
          <mat-icon>format_bold</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('*', '*')" matTooltip="Italic (Ctrl+I)">
          <mat-icon>format_italic</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('# ')" matTooltip="Heading">
          <mat-icon>title</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('[', '](url)')" matTooltip="Link (Ctrl+K)">
          <mat-icon>link</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('\`', '\`')" matTooltip="Code">
          <mat-icon>code</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('\`\`\`\\n', '\\n\`\`\`')" matTooltip="Code Block">
          <mat-icon>integration_instructions</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('- ')" matTooltip="Bullet List">
          <mat-icon>format_list_bulleted</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('1. ')" matTooltip="Numbered List">
          <mat-icon>format_list_numbered</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('> ')" matTooltip="Blockquote">
          <mat-icon>format_quote</mat-icon>
        </button>
        <button mat-icon-button (click)="insertMarkdown('---\\n')" matTooltip="Horizontal Rule">
          <mat-icon>horizontal_rule</mat-icon>
        </button>

        <span class="aca-markdown-editor__toolbar-spacer"></span>

        <button mat-icon-button (click)="showPreview = !showPreview"
                [matTooltip]="showPreview ? 'Hide Preview' : 'Show Preview'">
          <mat-icon>{{ showPreview ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-toolbar>

      <div class="aca-markdown-editor__content" [class.aca-markdown-editor__content--split]="showPreview">
        <div class="aca-markdown-editor__editor-pane">
          <textarea
            #editorTextarea
            class="aca-markdown-editor__textarea"
            [(ngModel)]="content"
            (ngModelChange)="onContentChange($event)"
            (keydown)="onKeydown($event, editorTextarea)"
            spellcheck="true"
          ></textarea>
        </div>
        <div class="aca-markdown-editor__preview-pane" *ngIf="showPreview">
          <div class="aca-markdown-editor__preview-content">
            <markdown [data]="content"></markdown>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .aca-markdown-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .aca-markdown-editor__toolbar {
      background: var(--theme-background-card-color, #fafafa);
      border-bottom: 1px solid var(--theme-divider-color, #e0e0e0);
      height: 48px;
      padding: 0 8px;
    }
    .aca-markdown-editor__toolbar-spacer {
      flex: 1;
    }
    .aca-markdown-editor__content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    .aca-markdown-editor__content--split .aca-markdown-editor__editor-pane {
      width: 50%;
      border-right: 1px solid var(--theme-divider-color, #e0e0e0);
    }
    .aca-markdown-editor__editor-pane {
      flex: 1;
      display: flex;
    }
    .aca-markdown-editor__textarea {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      resize: none;
      padding: 16px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
      tab-size: 2;
      background: var(--theme-background-card-color, #fff);
      color: var(--theme-text-color, #333);
    }
    .aca-markdown-editor__preview-pane {
      flex: 1;
      overflow: auto;
    }
    .aca-markdown-editor__preview-content {
      padding: 16px;
    }
  `]
})
export class MarkdownEditorComponent {
  @Input() content = '';
  @Output() contentChange = new EventEmitter<string>();

  showPreview = true;

  onContentChange(value: string): void {
    this.contentChange.emit(value);
  }

  insertMarkdown(prefix: string, suffix = ''): void {
    this.content = this.content + prefix + suffix;
    this.onContentChange(this.content);
  }

  onKeydown(event: KeyboardEvent, textarea: HTMLTextAreaElement): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          this.wrapSelection(textarea, '**', '**');
          break;
        case 'i':
          event.preventDefault();
          this.wrapSelection(textarea, '*', '*');
          break;
        case 'k':
          event.preventDefault();
          this.wrapSelection(textarea, '[', '](url)');
          break;
      }
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      this.content = this.content.substring(0, start) + '  ' + this.content.substring(end);
      this.onContentChange(this.content);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  }

  private wrapSelection(textarea: HTMLTextAreaElement, prefix: string, suffix: string): void {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = this.content.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;
    this.content = this.content.substring(0, start) + replacement + this.content.substring(end);
    this.onContentChange(this.content);

    setTimeout(() => {
      if (selected) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + replacement.length;
      } else {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + 4;
      }
      textarea.focus();
    });
  }
}
