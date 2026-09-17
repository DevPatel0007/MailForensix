import DOMPurify from 'dompurify';

// Configure DOMPurify to allow safe standard email styling and elements while neutralizing scripts, iframes, and vectors
const DEFAULT_ALLOWED_TAGS = [
  'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'table', 'tbody', 'td',
  'th', 'thead', 'tr', 'u', 'ul', 'font'
];

const DEFAULT_ALLOWED_ATTR = [
  'align', 'alt', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'class', 'color',
  'colspan', 'dir', 'height', 'href', 'id', 'name', 'rowspan', 'size', 'src', 'style',
  'target', 'title', 'valign', 'width'
];

export function sanitizeEmailHtml(rawHtml: string, allowExternalImages = false): string {
  if (!rawHtml) return '';

  // DOMPurify sanitize
  const clean = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: allowExternalImages ? DEFAULT_ALLOWED_TAGS : DEFAULT_ALLOWED_TAGS.filter(t => t !== 'img'),
    ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'base'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'javascript:'],
  });

  return clean;
}
