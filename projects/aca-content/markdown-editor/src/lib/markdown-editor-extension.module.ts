import { EnvironmentProviders, NgModule, Provider } from '@angular/core';
import { provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { provideTranslations } from '@alfresco/adf-core';
import { MarkdownViewerComponent } from './components/markdown-viewer/markdown-viewer.component';

export function provideMarkdownEditorExtension(): (Provider | EnvironmentProviders)[] {
  return [
    provideExtensionConfig(['markdown-editor.plugin.json']),
    provideTranslations('markdown-editor', 'assets/markdown-editor'),
    provideExtensions({
      components: {
        'markdown.components.markdown-viewer': MarkdownViewerComponent
      }
    })
  ];
}

/* @deprecated use `provideMarkdownEditorExtension()` provider api instead */
@NgModule({
  providers: [...provideMarkdownEditorExtension()]
})
export class MarkdownEditorExtensionModule {}
