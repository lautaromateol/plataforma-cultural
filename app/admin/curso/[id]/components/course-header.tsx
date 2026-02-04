import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseDetails } from "@/features/course/api/use-get-course";
import { ArrowLeft, GraduationCap, Calendar, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface CourseHeaderProps {
  course: CourseDetails;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const router = useRouter();

  const enrollmentsCount = course._count?.enrollments || 0;
  const occupancyPercentage = course?.capacity
    ? (enrollmentsCount / course.capacity) * 100
    : 0;

  let occupancyColor = "bg-green-50 text-green-600 border-green-200";
  if (occupancyPercentage >= 90) {
    occupancyColor = "bg-red-50 text-red-600 border-red-200";
  } else if (occupancyPercentage >= 70) {
    occupancyColor = "bg-blue-50 text-blue-600 border-blue-200";
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="shrink-0"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold tracking-tight">{course.name}</h1>
          <Badge variant="outline" className={occupancyColor}>
            {Math.round(occupancyPercentage)}% ocupado
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          {course.level && (
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>{course.level.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Año Académico {course.academicYear}</span>
          </div>
          {course.classroom && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{course.classroom}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
