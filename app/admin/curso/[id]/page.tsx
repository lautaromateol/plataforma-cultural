"use client";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useGetCourse } from "@/features/course/api/use-get-course";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CourseStats } from "./components/course-stats";
import { CourseSubjectAssignmentSection } from "./components/course-subject-assignment-section";
import { CourseHeader } from "./components/course-header";
import { CourseStudents } from "./components/course-students";

export default function CourseDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    course,
    isPending,
    error,
  } = useGetCourse(id);

  if (isPending) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No encontrado</AlertTitle>
          <AlertDescription>
            No se encontró información para este curso
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <CourseHeader course={course} />

      <CourseStats course={course} />

      <CourseSubjectAssignmentSection course={course} />

      <CourseStudents course={course} />
    </div>
  );
}
