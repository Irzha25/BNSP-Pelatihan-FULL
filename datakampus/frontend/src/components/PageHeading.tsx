type Props = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export default function PageHeading({ eyebrow, title, description, actionLabel, onAction, actionDisabled }: Props) {
  return (
    <section className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actionLabel && (
        <button className="primary-button" onClick={onAction} disabled={actionDisabled}>
          <span className="button-plus">＋</span> {actionLabel}
        </button>
      )}
    </section>
  );
}
