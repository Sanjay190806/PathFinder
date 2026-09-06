import React from 'react';
import { AIMessage } from '../../types';
import { renderSafeMarkdown } from '../../utils/securityUtils';
import { speakShaylaText } from '../../utils/shaylaVoice';
import { Button } from '../ui/Button';
import { Copy, Volume2 } from 'lucide-react';

interface ChatMessageProps {
  message: AIMessage;
  onRetry?: (message: AIMessage) => void;
  onEdit?: (message: AIMessage) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry, onEdit }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  const isFailed = message.status === 'failed';
  const isStreaming = message.status === 'streaming';
  const isSending = message.status === 'sending';

  const [copied, setCopied] = React.useState(false);
  const [textExpanded, setTextExpanded] = React.useState(false);

  // Parse document attachments
  let displayContent = message.content;
  let attachmentName: string | null = null;
  let extractedText: string | null = null;

  if (isUser && message.content && message.content.startsWith('[Document Attachment: ')) {
    const attachmentRegex = /^\[Document Attachment: ([^\]]+)\]\n-+\n([\s\S]*?)\n-+\nUser Message: ([\s\S]*)$/;
    const match = message.content.match(attachmentRegex);
    if (match) {
      attachmentName = match[1];
      extractedText = match[2];
      displayContent = match[3];
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      try {
        const { useToastStore } = await import('../../app/store/useToastStore');
        useToastStore.getState().showToast('Message copied to clipboard', 'success');
      } catch (e) {
        // Fallback silently if toast store is not imported
      }
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr);
      }
      document.body.removeChild(textarea);
    }
  };

  const handleMessageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('.copy-code-btn');
    if (button) {
      const code = button.getAttribute('data-code');
      if (code) {
        // Decode HTML entities
        const decodedCode = code
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');

        try {
          await navigator.clipboard.writeText(decodedCode);
          button.innerText = 'Copied';
          setTimeout(() => {
            button.innerText = 'Copy code';
          }, 2000);
          try {
            const { useToastStore } = await import('../../app/store/useToastStore');
            useToastStore.getState().showToast('Code copied to clipboard', 'success');
          } catch (toastErr) {}
        } catch (err) {
          const textarea = document.createElement('textarea');
          textarea.value = decodedCode;
          textarea.style.position = 'fixed';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            button.innerText = 'Copied';
            setTimeout(() => {
              button.innerText = 'Copy code';
            }, 2000);
          } catch (fallbackErr) {
            console.error('Fallback copy code failed', fallbackErr);
          }
          document.body.removeChild(textarea);
        }
      }
    }
  };

  let roleName = 'Unknown';
  if (isUser) roleName = 'You';
  else if (isAssistant) roleName = 'Shayla';
  else if (isSystem) roleName = 'System';
  else if (message.role) roleName = message.role.charAt(0).toUpperCase() + message.role.slice(1);

  const speakText = (text: string) => {
    speakShaylaText(text);
  };

  return (
    <div 
      className={`mt-3 flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
      aria-live="polite"
    >
      <div
        className={`max-w-[min(82%,760px)] rounded-2xl p-3.5 text-xs leading-relaxed select-text chat-message-content relative z-10 group ${
          isUser
            ? 'rounded-br-none bg-accentBlue text-white shadow-glow-blue'
            : isSystem
            ? 'rounded-none border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 w-full max-w-full text-center'
            : isFailed
            ? 'rounded-bl-none border border-red-500/30 bg-red-500/10 text-red-400'
            : 'rounded-bl-none border border-border-subtle bg-bgCard/60 text-textPrimary'
        }`}
      >
        {/* Actions Button Group (top-right, absolute, visible on hover/focus) */}
        {!isSystem && message.content && (
          <div className="absolute top-2.5 right-3 flex gap-1 group-hover:opacity-100 opacity-0 transition-opacity chat-copy-button">
            <button
              onClick={() => handleCopy(message.content)}
              className="inline-flex items-center gap-1 rounded border border-border-subtle/50 bg-bgSurface/90 px-2 py-0.5 text-[10px] text-textSecondary hover:bg-bgSurface hover:text-textPrimary focus:outline-none"
              title="Copy message"
            >
              <Copy className="h-3 w-3" />
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => speakText(message.content)}
              className="inline-flex items-center gap-1 rounded border border-border-subtle/50 bg-bgSurface/90 px-2 py-0.5 text-[10px] text-textSecondary hover:bg-bgSurface hover:text-textPrimary focus:outline-none"
              title="Listen Message"
            >
              <Volume2 className="h-3 w-3" />
              Listen
            </button>
          </div>
        )}

        {/* Header / Meta */}
        <div className={`mb-1 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-wider opacity-70 pr-8 ${isSystem ? 'justify-center pr-0' : ''}`}>
          <span>{roleName}</span>
          {!isUser && !isSystem && message.status && (
            <span
              className={`rounded-full px-2 py-0.5 ${
                isFailed 
                  ? 'bg-red-500/15 text-red-400' 
                  : isStreaming || isSending 
                    ? 'bg-accentBlue/15 text-accentBlue' 
                    : 'bg-accentEmerald/15 text-accentEmerald'
              }`}
            >
              {message.status}
            </span>
          )}
        </div>

        {/* Content body */}
        {isUser || isSystem ? (
          <div className="flex flex-col">
            {attachmentName && (
              <div className="mb-2.5 p-2.5 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-1 text-[10px] text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>📎</span>
                    <span>{attachmentName}</span>
                    <span className="opacity-60 text-[9px] font-normal">({extractedText?.length || 0} chars)</span>
                  </div>
                  {extractedText && (
                    <button
                      type="button"
                      onClick={() => setTextExpanded(!textExpanded)}
                      className="text-white underline text-[9px] font-bold"
                    >
                      {textExpanded ? 'Hide Text' : 'View Text'}
                    </button>
                  )}
                </div>
                {textExpanded && extractedText && (
                  <pre className="mt-2 p-2 rounded bg-black/45 border border-white/5 font-mono text-[9px] max-h-[120px] overflow-y-auto whitespace-pre-wrap text-white/80">
                    {extractedText}
                  </pre>
                )}
              </div>
            )}
            <p className="whitespace-pre-wrap">{displayContent}</p>
          </div>
        ) : (
          <>
            {message.content ? (
              <div
                className="prose-xs relative z-0 pr-10"
                dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(message.content) }} 
                onClick={handleMessageClick}
              />
            ) : (
              <div className="flex flex-col gap-1">
                <p className="italic text-textMuted text-[10px]">Shayla is typing...</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accentPurple" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accentPurple [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accentPurple [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Retry/Edit buttons on failure */}
        {isFailed && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-xl px-3 py-1 text-[10px]" onClick={() => onRetry?.(message)}>
              Retry
            </Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-xl px-3 py-1 text-[10px]" onClick={() => onEdit?.(message)}>
              Edit message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
