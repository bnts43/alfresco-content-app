# Markdown Editor Extension

An ACA (Alfresco Content App) extension that provides in-browser Markdown viewing and editing capabilities for `.md` and `.markdown` files stored in Alfresco Content Services.

## Features

- **Markdown Viewer**: Renders markdown files with full HTML preview using `ngx-markdown`
- **Markdown Editor**: Split-pane editor with live preview, toolbar formatting buttons, and keyboard shortcuts
- **Version Control**: Save dialog with minor/major version selection and comments, backed by the Alfresco Versions API
- **XSS Protection**: DOMPurify-based sanitization with configurable rules and Trusted Types API support
- **Permission-Aware**: Edit button only shown when the user has `update` permission on the node

## Architecture

```
markdown-editor/
├── assets/
│   ├── markdown-editor.plugin.json   # ADF extension descriptor
│   └── i18n/en.json                  # English translations
├── src/
│   ├── public-api.ts                 # Public API barrel export
│   └── lib/
│       ├── markdown-editor-extension.module.ts  # Extension provider registration
│       ├── components/
│       │   ├── markdown-viewer/       # Main viewer (registered with ADF Viewer)
│       │   ├── markdown-editor/       # Split-pane editor with toolbar
│       │   └── save-version-dialog/   # Version save dialog
│       └── services/
│           ├── markdown.service.ts          # Content fetch/save via Alfresco API
│           └── markdown-sanitizer.ts        # DOMPurify sanitization service
└── ng-package.json
```

## Registration

The extension is registered in `app/src/app/extensions.module.ts`:

```typescript
import { provideMarkdownEditorExtension } from '@alfresco/aca-content/markdown-editor';

...provideMarkdownEditorExtension(),
```

This registers:
- The `MarkdownViewerComponent` as `markdown.components.markdown-viewer`
- The plugin config from `markdown-editor.plugin.json`
- Translation files for `markdown-editor` scope

## Configuration

Sanitizer settings can be customized via `app.config.json`:

```json
{
  "markdownEditor": {
    "sanitizer": {
      "USE_PROFILES": { "html": true },
      "ADD_TAGS": ["iframe"],
      "ADD_ATTR": ["target", "allow", "allowfullscreen", "frameborder", "scrolling"],
      "FORBID_TAGS": ["script", "style"],
      "FORBID_ATTR": ["onerror", "onload", "onclick", "onmouseover"]
    }
  }
}
```

These settings are read by `MarkdownSanitizerService` via `AppConfigService` at runtime.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+B   | Bold   |
| Ctrl+I   | Italic |
| Ctrl+K   | Insert Link |
| Tab      | Indent (2 spaces) |

## Backend Requirements

Alfresco must recognize `.md` files as `text/markdown`. A custom MIME type mapping is provided at `backend/config/mimetype/custom-mimetype-map.xml` and mounted into the Alfresco container.

## Dependencies

- `ngx-markdown` - Markdown rendering
- `dompurify` - XSS sanitization
- `@alfresco/js-api` - Node content API (`NodesApi.updateNodeContent`)
- `@alfresco/adf-extensions` - Extension registration
- `@angular/material` - UI components
