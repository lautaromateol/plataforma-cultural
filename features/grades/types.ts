// Types for Grades feature

export interface QuizAttemptGrade {
  id: string
  studentId: string
  startedAt: Date
  submittedAt: Date | null
  timeRemaining: number
  score: number | null
  isSubmitted: boolean
  student: {
    id: string
    name: string
    email: string
  }
  quiz: {
    id: string
    title: string
    subject: {
      id: string
      name: string
      code: string
      level: {
        id: string
        name: string
        order: number
        studyPlan?: {
          id: string
          name: string
          code: string
        }
      }
      courseSubjects: Array<{
        id: string
        teacherId: string
        course: {
          id: string
          name: string
        }
        teacher?: {
          id: string
          name: string
        }
      }>
    }
  }
  answers: Array<{
    id: string
    textAnswer: string | null
    points: number | null
    isCorrect: boolean | null
    needsManualReview: boolean
    question: {
      id: string
      statement: string
      type: string
      points: number
    }
  }>
}

export interface AssignmentSubmissionGrade {
  id: string
  studentId: string
  submittedAt: Date
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  grade: number | null
  feedback: string | null
  student: {
    id: string
    name: string
    email: string
  }
  assignment: {
    id: string
    title: string
    assignmentCourseSubjects: Array<{
      courseSubject: {
        id: string
        teacherId: string
        subject: {
          id: string
          name: string
          code: string
          level: {
            id: string
            name: string
            order: number
            studyPlan?: {
              id: string
              name: string
              code: string
            }
          }
        }
        course: {
          id: string
          name: string
        }
        teacher?: {
          id: string
          name: string
        }
      }
    }>
  }
}

export interface Level {
  id: string
  name: string
  order: number
  studyPlan?: {
    id: string
    name: string
    code: string
  }
}

export interface Course {
  id: string
  name: string
}
