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
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.css']
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
