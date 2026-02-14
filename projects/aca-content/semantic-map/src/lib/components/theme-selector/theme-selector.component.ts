import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Theme } from '../../models/graph.model';

@Component({
  selector: 'sem-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSelectorComponent {

  @Input() themes: Theme[] = [];
  @Input() selectedThemeIds: string[] = [];
  @Input() loading = false;

  @Output() selectionChanged = new EventEmitter<string[]>();

  isSelected(themeId: string): boolean {
    return this.selectedThemeIds.includes(themeId);
  }

  toggleTheme(themeId: string): void {
    const current = [...this.selectedThemeIds];
    const idx = current.indexOf(themeId);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(themeId);
    }
    this.selectionChanged.emit(current);
  }

  selectAll(): void {
    this.selectionChanged.emit(this.themes.map(t => t.id));
  }

  clearAll(): void {
    this.selectionChanged.emit([]);
  }
}
