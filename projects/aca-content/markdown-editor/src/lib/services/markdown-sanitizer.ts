import { Injectable } from '@angular/core';
import { AppConfigService } from '@alfresco/adf-core';
import DOMPurify from 'dompurify';

export interface MarkdownSanitizerConfig {
  USE_PROFILES?: { html?: boolean; svg?: boolean; mathMl?: boolean };
  ADD_TAGS?: string[];
  ADD_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
}

const DEFAULT_SANITIZER_CONFIG: MarkdownSanitizerConfig = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  FORBID_TAGS: ['script', 'style'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
};

@Injectable({ providedIn: 'root' })
export class MarkdownSanitizerService {
  private config: MarkdownSanitizerConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private policy: any = null;

  constructor(private appConfig: AppConfigService) {
    this.config = this.appConfig.get<MarkdownSanitizerConfig>(
      'markdownEditor.sanitizer',
      DEFAULT_SANITIZER_CONFIG
    );
    this.initTrustedTypes();
  }

  sanitize(value: string): string {
    let purified = '';
    purified = DOMPurify.sanitize(value, this.config);
    if (this.policy) {
      purified = this.policy.createHTML(purified);
    }
    return purified.toString();
  }

  private initTrustedTypes(): void {
    const win = typeof window !== 'undefined' ? window as any : null;
    if (win?.trustedTypes?.createPolicy) {
      try {
        this.policy = win.trustedTypes.createPolicy('markdown-sanitizer', {
          createHTML: (input: string) => input
        });
      } catch {
        // Policy already created or Trusted Types not fully supported
      }
    }
  }
}

/** @deprecated Use MarkdownSanitizerService instead */
export function markdownSanitizer(value: string): string {
  return DOMPurify.sanitize(value, DEFAULT_SANITIZER_CONFIG);
}
