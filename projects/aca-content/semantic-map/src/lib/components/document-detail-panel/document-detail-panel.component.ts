import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DocumentDetail, SimilarDocument } from '../../models/graph.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'sem-document-detail-panel',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatChipsModule],
  templateUrl: './document-detail-panel.component.html',
  styleUrls: ['./document-detail-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentDetailPanelComponent {

  @Input() document: DocumentDetail | null = null;
  @Input() similarDocuments: SimilarDocument[] = [];
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() documentSelected = new EventEmitter<string>();
  @Output() openInAlfresco = new EventEmitter<string>();

  onClose(): void {
    this.closed.emit();
  }

  onSelectSimilar(nodeId: string): void {
    this.documentSelected.emit(nodeId);
  }

  onOpenInAlfresco(): void {
    if (this.document) {
      this.openInAlfresco.emit(this.document.alfrescoNodeId);
    }
  }

  getSimilarityPercent(score: number): number {
    return Math.round(score * 100);
  }
}
