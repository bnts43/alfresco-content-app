import { EnvironmentProviders, Provider } from '@angular/core';
import { provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { SemanticMapPageComponent } from './components/semantic-map-page/semantic-map-page.component';

export function provideSemanticMapExtension(): (Provider | EnvironmentProviders)[] {
  return [
    provideExtensionConfig(['semantic-map.plugin.json']),
    provideExtensions({
      components: {
        'semantic-map.main.component': SemanticMapPageComponent
      },
      evaluators: {
        'semantic-map.canShow': () => true
      }
    })
  ];
}
