import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface GradesStatCardProps {
    title: string
    icon: React.ReactNode
    value: string | number
    description?: string
}

export function GradesStatCard({ title, icon, value, description }: GradesStatCardProps) {
    return (
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    )
}