interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
}

export function StatBar({ label, value, maxValue = 20, color }: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-20">{label}</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full stat-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs text-slate-300 w-6 text-right">{value}</span>
    </div>
  );
}
