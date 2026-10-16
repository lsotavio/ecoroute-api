import { InvalidParam } from '../api';

export interface FeedbackState {
  kind: 'success' | 'error';
  title: string;
  detail: string;
  status?: number;
  invalidParams?: InvalidParam[];
}

interface FeedbackBannerProps {
  feedback: FeedbackState | null;
  onDismiss: () => void;
}

export function FeedbackBanner({ feedback, onDismiss }: FeedbackBannerProps) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={`feedback-banner ${
        feedback.kind === 'error' ? 'feedback-error' : 'feedback-success'
      }`}
      role="alert"
    >
      <div className="feedback-content">
        <div className="feedback-header">
          <strong>
            {feedback.title}
            {feedback.status ? ` (HTTP ${feedback.status})` : ''}
          </strong>
        </div>
        <p>{feedback.detail}</p>
        {feedback.invalidParams && feedback.invalidParams.length > 0 && (
          <ul className="invalid-params-list">
            {feedback.invalidParams.map((param, idx) => (
              <li key={`${param.name}-${idx}`}>
                <code>{param.name}</code>: {param.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        className="btn-dismiss"
        onClick={onDismiss}
        aria-label="Fechar notificação"
      >
        Fechar
      </button>
    </div>
  );
}
