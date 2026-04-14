import React, { useState, useRef, useEffect } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';
import { useTheme } from '../context/ThemeContext';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import type { ToolStep } from '../types';

interface ChatPanelProps {
  initialMessage?: string;
}

const ToolStepIndicator: React.FC<{ steps: ToolStep[]; colors: Record<string, string>; theme: string }> = ({ steps, colors }) => {
  const getToolColor = (tool: string) => {
    if (tool === 'scanner_analyst') return colors.teal;
    if (tool === 'tech_docs_search') return colors.accent;
    if (tool === 'ship_part') return colors.accentDark;
    return colors.accent;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '8px 12px',
      background: colors.surface,
      borderRadius: '10px',
      fontSize: '11px',
      border: `1px solid ${colors.borderSubtle}`,
    }}>
      {steps.map((step, idx) => (
        <div key={idx} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: step.status === 'pending' ? 0.4 : 1,
          transition: 'opacity 0.3s ease',
        }}>
          <div style={{ width: '16px', display: 'flex', justifyContent: 'center' }}>
            {step.status === 'complete' && <CheckCircleIcon style={{ fontSize: 14, color: colors.success }} />}
            {step.status === 'running' && (
              <HourglassBottomIcon style={{
                fontSize: 14,
                color: colors.teal,
                animation: 'spin 1s linear infinite',
              }} />
            )}
            {step.status === 'pending' && (
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: `1.5px solid ${colors.textDim}`,
              }} />
            )}
          </div>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '9px',
            fontWeight: 700,
            color: getToolColor(step.tool),
            background: getToolColor(step.tool) + '12',
            padding: '1px 6px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
          }}>
            {step.tool}
          </span>
          <span style={{
            color: step.status === 'running' ? colors.text : colors.textMuted,
            fontWeight: step.status === 'running' ? 500 : 400,
          }}>
            {step.description}
          </span>
        </div>
      ))}
    </div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ initialMessage }) => {
  const { theme, colors } = useTheme();
  const { messages, isLoading, activeToolSteps, error, sendMessage, clearMessages } = useAgentChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedPrompt = useRef<string | null>(null);

  useEffect(() => {
    if (initialMessage && initialMessage !== lastProcessedPrompt.current && !isLoading) {
      lastProcessedPrompt.current = initialMessage;
      sendMessage(initialMessage);
    }
  }, [initialMessage, sendMessage, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeToolSteps]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const formatMarkdown = (text: string) => {
    const headingColor = colors.teal;
    const subHeadingColor = colors.accentLight;
    const strongColor = colors.text;
    const codeBg = colors.surface;
    const blockquoteColor = colors.textMuted;
    const tableHeaderBg = colors.accentSubtle;
    const tableRowBg = colors.surface;
    const tableBorder = colors.border;

    let formatted = text
      .replace(/^## (.*$)/gim, `<h3 style="color:${headingColor};margin:16px 0 8px 0;font-size:16px;">$1</h3>`)
      .replace(/^### (.*$)/gim, `<h4 style="color:${subHeadingColor};margin:12px 0 6px 0;font-size:14px;">$1</h4>`)
      .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${strongColor};">$1</strong>`)
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, `<code style="background:${codeBg};padding:2px 6px;border-radius:4px;font-size:12px;">$1</code>`)
      .replace(/^> (.*$)/gim, `<blockquote style="border-left:3px solid ${headingColor};padding-left:12px;margin:8px 0;color:${blockquoteColor};font-style:italic;">$1</blockquote>`)
      .replace(/^- (.*$)/gim, '<li style="margin:4px 0;margin-left:16px;">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li style="margin:4px 0;margin-left:16px;">$1</li>');

    const tableRegex = /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g;
    formatted = formatted.replace(tableRegex, (_match, header, body) => {
      const headers = header.split('|').filter((h: string) => h.trim());
      const rows = body.trim().split('\n').map((row: string) =>
        row.split('|').filter((c: string) => c.trim())
      );

      return `
        <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:12px;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:${tableHeaderBg};">
              ${headers.map((h: string) => `<th style="padding:8px;border:1px solid ${tableBorder};text-align:left;">${h.trim()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row: string[]) => `
              <tr style="background:${tableRowBg};">
                ${row.map((cell: string) => `<td style="padding:8px;border:1px solid ${tableBorder};">${cell.trim()}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });

    return formatted.replace(/\n/g, '<br/>');
  };

  const suggestedQueries = [
    "Summarize open escalation cases by priority",
    "Show all SEV1 cases with SLA status and engineer assignments",
    "Source parts for ESC-2026-4281 with landed cost comparison",
    "What is the fleet impact of batch B-2024-X?",
    "Give me a status update on case ESC-2026-4281"
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: colors.bgSecondary,
      transition: 'background 0.3s ease',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: colors.accentGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SmartToyIcon style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <span style={{ fontWeight: 600, color: colors.text, fontSize: '13px' }}>KLA Diagnostic Agent</span>
            <div style={{ fontSize: '9px', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <span style={{ fontFamily: 'monospace', color: colors.teal, background: colors.tealSubtle, padding: '0 4px', borderRadius: '3px' }}>scanner_analyst</span>
              <span style={{ fontFamily: 'monospace', color: colors.accent, background: colors.accentSubtle, padding: '0 4px', borderRadius: '3px' }}>tech_docs</span>
              <span style={{ fontFamily: 'monospace', color: colors.textMuted, background: colors.pillBg, padding: '0 4px', borderRadius: '3px' }}>ship_part</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearMessages}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textDim,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
          }}
          title="Clear conversation"
        >
          <DeleteOutlineIcon style={{ fontSize: 18 }} />
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.length === 0 && (
          <div style={{ color: colors.textMuted, textAlign: 'center', marginTop: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: colors.pillBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <SmartToyIcon style={{ fontSize: 28, color: colors.textDim }} />
            </div>
            <p style={{ marginBottom: '20px', fontSize: '13px' }}>Ask about scanner diagnostics, fleet status, or parts inventory.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suggestedQueries.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(query)}
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: colors.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '12px',
                    transition: 'all 0.15s ease',
                    lineHeight: 1.3,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = colors.pillBg;
                    e.currentTarget.style.borderColor = colors.accent + '40';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = colors.surface;
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                background: msg.role === 'user' ? colors.accentSubtle : colors.tealSubtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {msg.role === 'user' ? (
                  <PersonIcon style={{ fontSize: 16, color: colors.accent }} />
                ) : (
                  <SmartToyIcon style={{ fontSize: 16, color: colors.teal }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {msg.role === 'assistant' && msg.toolSteps && msg.toolSteps.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <ToolStepIndicator steps={msg.toolSteps} colors={colors} theme={theme} />
                  </div>
                )}
                <div style={{
                  background: msg.role === 'user' ? colors.pillActiveBg : colors.surface,
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  padding: '10px 14px',
                  color: colors.text,
                  fontSize: '13px',
                  lineHeight: '1.6',
                  border: `1px solid ${colors.borderSubtle}`,
                }}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              background: colors.tealSubtle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <SmartToyIcon style={{ fontSize: 16, color: colors.teal }} />
            </div>
            <div style={{ flex: 1 }}>
              {activeToolSteps.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <ToolStepIndicator steps={activeToolSteps} colors={colors} theme={theme} />
                </div>
              )}
              {activeToolSteps.length === 0 && (
                <div style={{
                  background: colors.surface,
                  borderRadius: '12px 12px 12px 4px',
                  padding: '10px 14px',
                  color: colors.textMuted,
                  border: `1px solid ${colors.borderSubtle}`,
                  fontSize: '13px',
                }}>
                  <span className="typing-indicator">Analyzing...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: colors.critical + '08',
            border: `1px solid ${colors.critical}25`,
            borderRadius: '10px',
            padding: '10px 14px',
            color: colors.critical,
            fontSize: '12px',
          }}>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{
        padding: '10px 14px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about escalations, parts, diagnostics..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: colors.inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            padding: '10px 14px',
            color: colors.text,
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            background: colors.accentGradient,
            border: 'none',
            borderRadius: '10px',
            width: '38px',
            height: '38px',
            color: '#fff',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          <SendIcon style={{ fontSize: 18 }} />
        </button>
      </form>
    </div>
  );
};
