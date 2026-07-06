"use client";

interface BarChartProps {
  data: { label: string; value: number; secondaryValue?: number }[];
  valueFormatter?: (v: number) => string;
  color?: string;
  secondaryColor?: string;
  height?: number;
}

export function BarChart({
  data,
  valueFormatter = (v) => String(v),
  color = "#cc0000",
  secondaryColor = "#f8b4b4",
  height = 220,
}: BarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No data for this range.</p>;
  }

  const max = Math.max(...data.map((d) => d.value + (d.secondaryValue ?? 0)), 1);

  return (
    <div className="overflow-x-auto">
      <div
        className="flex items-end gap-3 min-w-fit"
        style={{ height }}
      >
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center justify-end h-full gap-1 flex-shrink-0 w-16">
            <div className="flex flex-col justify-end h-full w-8 rounded-t overflow-hidden bg-gray-100 dark:bg-gray-800">
              {d.secondaryValue !== undefined && (
                <div
                  style={{ height: `${(d.secondaryValue / max) * 100}%`, backgroundColor: secondaryColor }}
                  title={valueFormatter(d.secondaryValue)}
                />
              )}
              <div
                style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color }}
                title={valueFormatter(d.value)}
              />
            </div>
            <span className="text-[10px] text-gray-500 text-center leading-tight">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
