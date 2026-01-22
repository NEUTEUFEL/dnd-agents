interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="text-center text-slate-400 text-sm mb-2">{label}</div>
      )}
      <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #06b6d4 0%, #22c55e 50%, #eab308 100%)',
          }}
        />
        {/* Progress text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-lg">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
