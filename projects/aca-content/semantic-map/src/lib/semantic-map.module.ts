import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SigmaGraphComponent } from './components/sigma-graph/sigma-graph.component';
import { ThemeSelectorComponent } from './components/theme-selector/theme-selector.component';
import { DocumentDetailPanelComponent } from './components/document-detail-panel/document-detail-panel.component';
import { SemanticMapPageComponent } from './components/semantic-map-page/semantic-map-page.component';

const routes: Routes = [
  { path: '', component: SemanticMapPageComponent }
];

@NgModule({
  declarations: [
    SigmaGraphComponent,
    ThemeSelectorComponent,
    DocumentDetailPanelComponent,
    SemanticMapPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  exports: [
    SemanticMapPageComponent
  ]
})
export class SemanticMapModule {}
