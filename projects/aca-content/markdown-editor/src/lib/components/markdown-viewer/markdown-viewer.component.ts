import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges, Output, SecurityContext, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Node, NodesApi } from '@alfresco/js-api';
import { MarkdownService } from '../../services/markdown.service';
import { MarkdownSanitizerService } from '../../services/markdown-sanitizer';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { SaveVersionDialogComponent, SaveVersionDialogResult } from '../save-version-dialog/save-version-dialog.component';
import { AlfrescoApiService } from '@alfresco/adf-content-services';

@Component({
  selector: 'aca-markdown-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslatePipe,
    MarkdownModule,
    MarkdownEditorComponent
  ],
  providers: [
    provideMarkdown({
      sanitize: SecurityContext.NONE
    })
  ],
  templateUrl: './markdown-viewer.component.html',
  styleUrls: ['./markdown-viewer.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'aca-markdown-viewer' }
})
export class MarkdownViewerComponent implements OnChanges {
  @Input() url: string;
  @Input() extension: string;
  @Input() nodeId: string;
  @Output() contentLoaded = new EventEmitter<void>();

  node: Node;
  markdownContent: string | null = null;
  editContent = '';
  editMode = false;
  loading = false;
  saving = false;
  canEdit = false;
  isDirty = false;

  private readonly destroyRef = inject(DestroyRef);
  private nodesApi: NodesApi;

  constructor(
    private markdownService: MarkdownService,
    private sanitizerService: MarkdownSanitizerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private alfrescoApiService: AlfrescoApiService
  ) {
    this.nodesApi = new NodesApi(this.alfrescoApiService.getInstance());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodeId'] && this.nodeId) {
      this.loadNode();
    }
  }

  private loadNode(): void {
    this.loading = true;
    this.nodesApi.getNode(this.nodeId, { include: ['allowableOperations'] }).then(
      (nodeEntry) => {
        this.node = nodeEntry.entry;
        this.canEdit = this.node.allowableOperations?.includes('update') ?? false;
        this.loadContent();
      },
      () => {
        this.loading = false;
        this.loadContent();
      }
    );
  }

  enterEditMode(): void {
    this.editMode = true;
    this.editContent = this.markdownContent || '';
    this.isDirty = false;
  }

  onEditorContentChange(content: string): void {
    this.editContent = content;
    this.isDirty = true;
  }

  onSave(): void {
    const dialogRef = this.dialog.open(SaveVersionDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: SaveVersionDialogResult | undefined) => {
        if (result) {
          this.saveContent(result.majorVersion, result.comment);
        }
      });
  }

  onCancel(): void {
    if (this.isDirty) {
      const message = this.translateService.instant('MARKDOWN_EDITOR.NOTIFICATIONS.UNSAVED_CHANGES');
      if (!confirm(message)) {
        return;
      }
    }
    this.editMode = false;
  }

  private loadContent(): void {
    if (!this.nodeId) {
      return;
    }

    this.loading = true;
    this.markdownService
      .fetchContent(this.nodeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (content) => {
          this.markdownContent = this.sanitizerService.sanitize(content);
          this.loading = false;
          this.contentLoaded.emit();
        },
        error: () => {
          this.markdownContent = '';
          this.loading = false;
          this.contentLoaded.emit();
        }
      });
  }

  private saveContent(majorVersion: boolean, comment: string): void {
    this.saving = true;
    this.markdownService
      .saveContent(this.nodeId, this.editContent, majorVersion, comment)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.markdownContent = this.sanitizerService.sanitize(this.editContent);
          this.editMode = false;
          this.saving = false;
          this.isDirty = false;
          this.snackBar.open(
            this.translateService.instant('MARKDOWN_EDITOR.NOTIFICATIONS.SAVE_SUCCESS'),
            '',
            { duration: 3000 }
          );
        },
        error: () => {
          this.saving = false;
          this.snackBar.open(
            this.translateService.instant('MARKDOWN_EDITOR.NOTIFICATIONS.SAVE_ERROR'),
            '',
            { duration: 5000 }
          );
        }
      });
  }
}
