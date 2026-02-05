import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TeacherStatsCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  color: "blue" | "emerald" | "purple";
}) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      linear: "from-blue-500/10 to-indigo-500/10",
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      linear: "from-emerald-500/10 to-teal-500/10",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      linear: "from-purple-500/10 to-pink-500/10",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur">
      <div
        className={`absolute inset-0 bg-linear-to-br ${colors.linear} opacity-0 group-hover:opacity-100 transition-opacity`}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-xl ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}