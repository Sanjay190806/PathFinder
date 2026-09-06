export function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function safeUrl(url: unknown): string {
  const s = safeString(url).trim();
  if (/^(https?|mailto):/i.test(s)) {
    return s;
  }
  return '#';
}

export function escapeHTML(str: unknown): string {
  const s = safeString(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeMarkdown(input: unknown): string {
  const text = safeString(input);
  if (!text) return '';

  // 1. Escape HTML for core XSS hardening
  let html = escapeHTML(text);

  // 2. Parse Code Blocks: ```code```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const displayLang = lang ? lang.toUpperCase() : 'CODE';
    const escapedCode = code
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return `<div class="relative group/code my-3 rounded-xl overflow-hidden border border-white/10 bg-gray-950 font-mono text-xs"><div class="flex items-center justify-between px-4 py-1.5 bg-gray-900 border-b border-white/5 text-[10px] text-textMuted select-none"><span>${displayLang}</span><button type="button" class="copy-code-btn px-2 py-0.5 rounded hover:bg-white/10 hover:text-textPrimary transition text-[9px] font-sans pointer-events-auto focus:outline-none focus:ring-1 focus:ring-accentBlue" data-code="${escapedCode}" aria-label="Copy code block">Copy code</button></div><pre class="p-3 overflow-x-auto text-textSecondary"><code class="block whitespace-pre">${code}</code></pre></div>`;
  });

  // 3. Parse Inline Code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-800 border border-white/5 px-1.5 py-0.5 rounded text-xs font-mono text-accentBlue">$1</code>');

  // 4. Parse Bold: **text**
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');

  // 5. Parse Italic: *text* or _text_
  html = html.replace(/\*([\s\S]+?)\*/g, '<em>$1</em>');
  html = html.replace(/_([\s\S]+?)_/g, '<em>$1</em>');

  // 6. Parse Links: [text](url) (only if URL is safe)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
    const cleanUrl = safeUrl(url);
    if (cleanUrl === '#') {
      return linkText;
    }
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-accentBlue hover:underline">${linkText}</a>`;
  });

  // 7. Parse lists (unordered and ordered)
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    // Bullet list: starts with - or *
    if (/^[-*]\s+(.*)$/.test(trimmed)) {
      const content = trimmed.replace(/^[-*]\s+/, '');
      let prefix = '';
      if (!inList) {
        inList = true;
        prefix = '<ul class="list-disc pl-5 my-2 flex flex-col gap-1">';
      }
      return `${prefix}<li class="text-xs text-textSecondary">${content}</li>`;
    }
    // Numbered list: starts with 1., 2. etc.
    if (/^\d+\.\s+(.*)$/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s+/, '');
      let prefix = '';
      if (!inList) {
        inList = true;
        prefix = '<ol class="list-decimal pl-5 my-2 flex flex-col gap-1">';
      }
      return `${prefix}<li class="text-xs text-textSecondary">${content}</li>`;
    }

    // Line is not a list item
    let suffix = '';
    if (inList) {
      inList = false;
      suffix = '</ul>'; // Closes either list
    }
    return suffix + line;
  });

  if (inList) {
    processedLines.push('</ul>');
  }

  // Join lines back and replace normal newlines with <br> outside <pre> blocks.
  let finalHtml = processedLines.join('\n');
  const parts = finalHtml.split(/(<\/pre>|<pre[^>]*>)/g);
  let isPre = false;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith('<pre')) {
      isPre = true;
    } else if (parts[i] === '</pre>') {
      isPre = false;
    } else if (!isPre) {
      parts[i] = parts[i].replace(/\n/g, '<br>');
    }
  }
  finalHtml = parts.join('');

  return finalHtml;
}

export function renderSafeMarkdown(text: unknown): string {
  return sanitizeMarkdown(text);
}
