type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
};

export default function ApexChatInput({
  value,
  onChange,
  onSend,
  onCancel,
  loading,
  disabled,
  placeholder = 'Discuss, deliberate, ask…',
  compact,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <div className={`apex-chat-input-row ${compact ? 'apex-chat-input-compact' : ''}`}>
      <textarea
        rows={compact ? 2 : 3}
        className="neu-input-el flex-1 text-base min-w-0 resize-y max-h-64 leading-relaxed"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !isDisabled && value.trim()) {
            e.preventDefault();
            onSend();
          }
        }}
        disabled={isDisabled}
        aria-label="Message the AI tutor"
        aria-description="Enter sends your message. Shift plus Enter adds a new line."
      />
      <button
        type="button"
        className="btn-solid text-sm px-4 py-2 shrink-0 disabled:opacity-50"
        onClick={loading && onCancel ? onCancel : onSend}
        disabled={loading ? !onCancel : isDisabled || !value.trim()}
      >
        {loading && onCancel ? 'Stop' : 'Send'}
      </button>
    </div>
  );
}
