import { useGetLevels } from "@/features/level/api/use-get-levels";
import { useGetCourses } from "@/features/course/api/use-get-courses";
import { useGetSubjects } from "@/features/subject/api/use-get-subjects";
import { useGetUsers, type User } from "@/features/user/api/use-get-users";
import { useGetStudyPlans } from "@/features/study-plan/api/use-get-study-plans";

export function useGetStats() {
  const { studyPlans, isPending: isLoadingStudyPlans } = useGetStudyPlans();
  const { levels, isPending: isLoadingLevels } = useGetLevels();
  const { courses, isPending: isLoadingCourses } = useGetCourses();
  const { subjects, isPending: isLoadingSubjects } = useGetSubjects();
  const { users, isPending: isLoadingUsers } = useGetUsers();

  const stats = {
    studyPlansCount: studyPlans?.length || 0,
    levelsCount: levels?.length || 0,
    coursesCount: courses?.length || 0,
    subjectsCount: subjects?.length || 0,
    usersCount: users?.length || 0,
    studentsCount: users?.filter((u: User) => u.role === "STUDENT").length || 0,
    teachersCount: users?.filter((u: User) => u.role === "TEACHER").length || 0,
    adminsCount: users?.filter((u: User) => u.role === "ADMIN").length || 0,
  };

  const isPending =
    isLoadingStudyPlans || isLoadingLevels || isLoadingCourses || isLoadingSubjects || isLoadingUsers;

  return {
    stats,
    isPending,
  };
}

