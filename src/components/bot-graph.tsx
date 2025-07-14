import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useTheme } from '@/context/theme-context';

/* ────────────────────────────────────────────────────────── */
/* ↓ props                                                   */
export interface BotGraphProps {
    data: Record<string, any>[];
    axes: { x_axis_key: string; y_axis_keys: string[] };
    type?: string;
}
/* ────────────────────────────────────────────────────────── */

export function BotGraph({
    data,
    axes,
    type = 'area_chart',
}: BotGraphProps) {
    const { theme } = useTheme();

    /* ─────────  palette per theme  ───────── */
    const palette = (() => {
        switch (theme) {
            case 'dark':
            case 'transflow-dark':
                return ['#60a5fa', '#f472b6', '#34d399', '#facc15', '#a78bfa'];
            case 'transflow-light':
                return ['#08518A', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];
            default: // light
                return ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        }
    })();

    const getFormatter = (key: string) =>
        key.toLowerCase().includes('amount')
            ? (v: number) => `₵${v.toLocaleString()}`
            : (v: number) => v.toLocaleString();


    /* ─────────  mode (amount vs count)  ───────── */
    const mode = axes?.y_axis_keys?.some(k =>
        k.toLowerCase().includes('amount'),
    )
        ? 'amount'
        : 'count';

    const formatValue = (v: number) =>
        mode === 'amount' ? `₵${v.toLocaleString()}` : v.toLocaleString();

    /* ─────────  Tooltip  ───────── */
    const tooltipContent = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;

        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="mb-1 text-[0.7rem] uppercase text-muted-foreground">
                    {(axes.x_axis_key).replace("_", " ")}
                </div>
                <div className="mb-2 font-semibold">{label}</div>

                {payload.map((item: any, i: number) => (
                    <div
                        key={item.dataKey}
                        className="flex items-center justify-between gap-2 text-sm"
                    >
                        <span className="flex items-center gap-1 capitalize text-muted-foreground">
                            {/* colour dot */}
                            <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {(item.name || item.dataKey).replace("_", " ")}
                        </span>
                        <span className="font-medium">{getFormatter(item.dataKey)(item.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    /* ─────────  guards  ───────── */
    if (!data?.length || !axes?.x_axis_key || !axes?.y_axis_keys?.length) {
        return (
            <div className="flex h-[350px] items-center justify-center">
                <div className="text-muted-foreground">
                    Invalid or empty chart data&hellip;
                </div>
            </div>
        );
    }

    /* ─────────  render  ───────── */
    return (
        <ResponsiveContainer width="100%" height={350}>
            {type === 'area_chart' ? (
                /* ==================  AREA CHART  ================== */
                <AreaChart data={data}>
                    {/* one gradient per series */}
                    <defs>
                        {axes.y_axis_keys.map((_, i) => (
                            <linearGradient
                                key={i}
                                id={`fill-${i}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={palette[i % palette.length]}
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={palette[i % palette.length]}
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        ))}
                    </defs>

                    <XAxis
                        dataKey={axes.x_axis_key}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={getFormatter(axes.y_axis_keys[0])}
                    />

                    <Tooltip content={tooltipContent} />

                    {axes.y_axis_keys.map((key, i) => (
                        <Area
                            key={key}
                            dataKey={key}
                            type="monotone"
                            stroke={palette[i % palette.length]}
                            fill={`url(#fill-${i})`}
                        />
                    ))}
                </AreaChart>
            ) : (
                /* ==================  BAR CHART  ================== */
                <BarChart data={data}>
                    <XAxis
                        dataKey={axes.x_axis_key}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={getFormatter(axes.y_axis_keys[0])}
                    />
                    <Tooltip content={tooltipContent} />

                    {axes.y_axis_keys.map((key, i) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            fill={palette[i % palette.length]}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </BarChart>
            )}
        </ResponsiveContainer>
    );
}