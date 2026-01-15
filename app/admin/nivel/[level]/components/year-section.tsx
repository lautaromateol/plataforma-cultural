import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface YearSectionProps {
  title: string;
  yearName: string;
  children: React.ReactNode;
  isPending: boolean;
  error: Error | null;
}

export function YearSection({
  title,
  yearName,
  children,
  isPending,
  error,
}: YearSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Lista de {title} asignados al año {yearName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Cargando {title}</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              Espere un instante por favor.
            </p>
          </div>
        ) : error ? (
          <div>{error.message}</div>
        ) : (
          <>{children}</>
        )}
      </CardContent>
    </Card>
  );
}
