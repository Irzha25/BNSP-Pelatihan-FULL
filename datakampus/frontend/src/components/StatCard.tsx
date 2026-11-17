type Props = {
  label: string;
  icon: string;
  tone: "blue" | "purple" | "green" | "orange";
  value: string | number;
  foot: string;
};

export default function StatCard({ label, icon, tone, value, foot }: Props) {
  return (
    <article className="stat-card">
      <div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </article>
  );
}
