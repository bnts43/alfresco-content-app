import { ExtensionService } from '@alfresco/adf-extensions';

export function setupSemanticMapExtension(extensions: ExtensionService): void {
  extensions.setEvaluators({
    'semantic-map.canShow': () => true
  });
}
