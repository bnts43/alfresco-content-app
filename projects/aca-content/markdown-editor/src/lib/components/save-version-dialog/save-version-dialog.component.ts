import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

export interface SaveVersionDialogResult {
  majorVersion: boolean;
  comment: string;
}

@Component({
  selector: 'aca-save-version-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe
  ],
  template: `
    <h2 mat-dialog-title>{{ 'MARKDOWN_EDITOR.SAVE_DIALOG.TITLE' | translate }}</h2>
    <mat-dialog-content>
      <div class="aca-save-version-dialog__version-type">
        <label>{{ 'MARKDOWN_EDITOR.SAVE_DIALOG.VERSION_LABEL' | translate }}</label>
        <mat-radio-group [(ngModel)]="majorVersion">
          <mat-radio-button [value]="false">
            {{ 'MARKDOWN_EDITOR.SAVE_DIALOG.MINOR_VERSION' | translate }}
          </mat-radio-button>
          <mat-radio-button [value]="true">
            {{ 'MARKDOWN_EDITOR.SAVE_DIALOG.MAJOR_VERSION' | translate }}
          </mat-radio-button>
        </mat-radio-group>
      </div>
      <mat-form-field class="aca-save-version-dialog__comment" appearance="outline">
        <mat-label>{{ 'MARKDOWN_EDITOR.SAVE_DIALOG.COMMENT_LABEL' | translate }}</mat-label>
        <textarea
          matInput
          [(ngModel)]="comment"
          [placeholder]="'MARKDOWN_EDITOR.SAVE_DIALOG.COMMENT_PLACEHOLDER' | translate"
          rows="3"
          required
        ></textarea>
        <mat-error *ngIf="!comment">
          {{ 'MARKDOWN_EDITOR.SAVE_DIALOG.COMMENT_REQUIRED' | translate }}
        </mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ 'MARKDOWN_EDITOR.SAVE_DIALOG.CANCEL_BUTTON' | translate }}
      </button>
      <button mat-flat-button color="primary" [disabled]="!comment" (click)="onSave()">
        {{ 'MARKDOWN_EDITOR.SAVE_DIALOG.SAVE_BUTTON' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .aca-save-version-dialog__version-type {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .aca-save-version-dialog__version-type mat-radio-group {
      display: flex;
      gap: 16px;
    }
    .aca-save-version-dialog__comment {
      width: 100%;
    }
  `]
})
export class SaveVersionDialogComponent {
  majorVersion = false;
  comment = '';

  constructor(private dialogRef: MatDialogRef<SaveVersionDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.comment) {
      this.dialogRef.close({
        majorVersion: this.majorVersion,
        comment: this.comment
      } as SaveVersionDialogResult);
    }
  }
}
