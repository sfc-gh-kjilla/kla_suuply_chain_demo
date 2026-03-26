import React, { useState, useRef, useEffect } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';
import { useTheme } from '../context/ThemeContext';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

interface ChatPanelProps {
  initialMessage?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ initialMessage }) => {
  const { theme, colors } = useTheme();
  const { messages, isLoading, error, sendMessage, clearMessages, isUsingRealAgent } = useAgentChat();
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
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const formatMarkdown = (text: string) => {
    const headingColor = theme === 'dark' ? '#64b5f6' : '#1976d2';
    const subHeadingColor = theme === 'dark' ? '#90caf9' : '#2196f3';
    const strongColor = theme === 'dark' ? '#fff' : '#1a1a1a';
    const codeBg = theme === 'dark' ? '#2d2d2d' : '#f5f5f5';
    const blockquoteColor = theme === 'dark' ? '#aaa' : '#666';
    const tableHeaderBg = theme === 'dark' ? '#1e3a5f' : '#e3f2fd';
    const tableRowBg = theme === 'dark' ? '#1a2332' : '#fafafa';
    const tableBorder = theme === 'dark' ? '#333' : '#ddd';

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
        <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:12px;">
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
    "Which scanners are performing worst right now?",
    "Show me other scanners where this same pattern has been observed",
    "Have we deferred any preventive maintenance that could explain this?",
    "Check inventory for part 994-023 and recommend a repair",
    "Analyze batch B-2024-X failure pattern across all customers"
  ];

  const userMsgBg = theme === 'dark' ? '#1a2332' : '#e3f2fd';
  const assistantMsgBg = theme === 'dark' ? '#161b22' : '#f5f5f5';
  const inputBg = theme === 'dark' ? '#161b22' : '#ffffff';
  const buttonBg = theme === 'dark' ? '#1a2332' : '#e3f2fd';
  const buttonHoverBg = theme === 'dark' ? '#1e3a5f' : '#bbdefb';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: colors.bgSecondary,
      borderLeft: `1px solid ${colors.border}`,
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SmartToyIcon style={{ color: colors.accent }} />
          <span style={{ fontWeight: 600, color: colors.text }}>KLA Diagnostic Agent</span>
        </div>
        <button
          onClick={clearMessages}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textMuted,
            cursor: 'pointer',
            padding: '4px',
          }}
          title="Clear conversation"
        >
          <DeleteOutlineIcon fontSize="small" />
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
            <SmartToyIcon style={{ fontSize: 48, color: colors.textDim, marginBottom: '12px' }} />
            <p style={{ marginBottom: '20px' }}>Ask me about scanner diagnostics, fleet status, or parts inventory.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {suggestedQueries.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(query)}
                  style={{
                    background: buttonBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: colors.accent,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = buttonHoverBg}
                  onMouseOut={(e) => e.currentTarget.style.background = buttonBg}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: msg.role === 'user' 
                ? (theme === 'dark' ? '#1e3a5f' : '#bbdefb') 
                : (theme === 'dark' ? '#2d4a3e' : '#c8e6c9'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {msg.role === 'user' ? (
                <PersonIcon style={{ fontSize: 18, color: colors.accent }} />
              ) : (
                <SmartToyIcon style={{ fontSize: 18, color: colors.success }} />
              )}
            </div>
            <div style={{
              flex: 1,
              background: msg.role === 'user' ? userMsgBg : assistantMsgBg,
              borderRadius: '12px',
              padding: '12px 16px',
              color: colors.text,
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: theme === 'dark' ? '#2d4a3e' : '#c8e6c9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SmartToyIcon style={{ fontSize: 18, color: colors.success }} />
            </div>
            <div style={{
              background: assistantMsgBg,
              borderRadius: '12px',
              padding: '12px 16px',
              color: colors.textMuted,
            }}>
              <span className="typing-indicator">Analyzing...</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: theme === 'dark' ? '#3d1f1f' : '#ffebee',
            border: `1px solid ${colors.critical}`,
            borderRadius: '8px',
            padding: '12px',
            color: theme === 'dark' ? '#ff8a80' : '#c62828',
            fontSize: '13px',
          }}>
            Error: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{
        padding: '16px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        gap: '8px',
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about scanners, alerts, or parts..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: inputBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '12px 16px',
            color: colors.text,
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            background: '#238636',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fff',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SendIcon fontSize="small" />
        </button>
      </form>
    </div>
  );
};
