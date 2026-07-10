type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  placeholder?: string;
  compact?: boolean;
};

export default function ApexChatInput({
  value,
  onChange,
  onSend,
  loading,
  placeholder = 'Discuss, deliberate, ask…',
  compact,
}: Props) {
  return (
    <div className={`apex-chat-input-row ${compact ? 'apex-chat-input-compact' : ''}`}>
      <input
        className="neu-input-el flex-1 text-sm min-w-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
        disabled={loading}
        aria-label="Message to Apex"
      />
      <button
        type="button"
        className="btn-solid text-sm px-4 py-2 shrink-0 disabled:opacity-50"
        onClick={onSend}
        disabled={loading || !value.trim()}
      >
        Send
      </button>
    </div>
  );
}
