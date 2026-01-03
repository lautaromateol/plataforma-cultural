import { useGetYears } from "@/features/year/api/use-get-years";
import { useGetCourses } from "@/features/course/api/use-get-courses";
import { useGetSubjects } from "@/features/subject/api/use-get-subjects";
import { useGetUsers, type User } from "@/features/user/api/use-get-users";

export function useGetStats() {
  const { years, isPending: isLoadingYears } = useGetYears();
  const { courses, isPending: isLoadingCourses } = useGetCourses();
  const { subjects, isPending: isLoadingSubjects } = useGetSubjects();
  const { users, isPending: isLoadingUsers } = useGetUsers();

  const stats = {
    yearsCount: years?.length || 0,
    coursesCount: courses?.length || 0,
    subjectsCount: subjects?.length || 0,
    usersCount: users?.length || 0,
    studentsCount: users?.filter((u: User) => u.role === "STUDENT").length || 0,
    teachersCount: users?.filter((u: User) => u.role === "TEACHER").length || 0,
    adminsCount: users?.filter((u: User) => u.role === "ADMIN").length || 0,
  };

  const isPending =
    isLoadingYears || isLoadingCourses || isLoadingSubjects || isLoadingUsers;

  return {
    stats,
    isPending,
  };
}

