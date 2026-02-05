import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import auth from "@/lib/middlewares/auth-middleware"
import { updateQuizGradeSchema, updateAssignmentGradeSchema, getGradesQuerySchema } from "../schemas"

const app = new Hono()
  .use("*", auth)

  .get("/", zValidator("query", getGradesQuerySchema), async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { levelId, courseId } = c.req.valid("query")

    if (user.role === "STUDENT") {
      // Obtener calificaciones del estudiante
      const quizAttempts = await prisma.quizAttempt.findMany({
        where: {
          studentId: user.sub,
          isSubmitted: true,
          quiz: {
            subject: {
              courseSubjects: {
                some: {
                  course: {
                    enrollments: {
                      some: {
                        studentId: user.sub,
                        status: "ACTIVE",
                      },
                    },
                    ...(levelId && { levelId }),
                    ...(courseId && { id: courseId }),
                  },
                },
              },
            },
          },
        },
        include: {
          quiz: {
            include: {
              subject: {
                include: {
                  courseSubjects: {
                    include: {
                      course: true,
                      teacher: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                  level: {
                    include: {
                      studyPlan: {
                        select: { id: true, name: true, code: true },
                      },
                    },
                  },
                },
              },
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
          student: true
        },
        orderBy: {
          submittedAt: "desc",
        },
      })

      const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
        where: {
          studentId: user.sub,
          assignment: {
            assignmentCourseSubjects: {
              some: {
                courseSubject: {
                  course: {
                    enrollments: {
                      some: {
                        studentId: user.sub,
                        status: "ACTIVE",
                      },
                    },
                    ...(levelId && { levelId }),
                    ...(courseId && { id: courseId }),
                  },
                },
              },
            },
          },
        },
        include: {
          assignment: {
            include: {
              assignmentCourseSubjects: {
                include: {
                  courseSubject: {
                    include: {
                      subject: {
                        include: {
                          level: {
                            include: {
                              studyPlan: {
                                select: { id: true, name: true, code: true },
                              },
                            },
                          },
                        },
                      },
                      course: true,
                      teacher: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          student: true
        },
        orderBy: {
          submittedAt: "desc",
        },
      })

      return c.json({
        quizAttempts,
        assignmentSubmissions,
      })
    } else if (user.role === "TEACHER") {
      // Obtener calificaciones de estudiantes del profesor
      const quizAttempts = await prisma.quizAttempt.findMany({
        where: {
          isSubmitted: true,
          quiz: {
            subject: {
              courseSubjects: {
                some: {
                  teacherId: user.sub,
                  ...(levelId && {
                    course: {
                      levelId,
                      ...(courseId && { id: courseId }),
                    },
                  }),
                  ...(courseId && !levelId && {
                    course: {
                      id: courseId,
                    },
                  }),
                },
              },
            },
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quiz: {
            include: {
              subject: {
                include: {
                  courseSubjects: {
                    where: {
                      teacherId: user.sub,
                    },
                    include: {
                      course: true,
                      teacher: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                  level: {
                    include: {
                      studyPlan: {
                        select: { id: true, name: true, code: true },
                      },
                    },
                  },
                },
              },
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      })

      const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
        where: {
          assignment: {
            assignmentCourseSubjects: {
              some: {
                courseSubject: {
                  teacherId: user.sub,
                  ...(levelId && {
                    course: {
                      levelId,
                      ...(courseId && { id: courseId }),
                    },
                  }),
                  ...(courseId && !levelId && {
                    course: {
                      id: courseId,
                    },
                  }),
                },
              },
            },
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            include: {
              assignmentCourseSubjects: {
                include: {
                  courseSubject: {
                    include: {
                      subject: {
                        include: {
                          level: {
                            include: {
                              studyPlan: {
                                select: { id: true, name: true, code: true },
                              },
                            },
                          },
                        },
                      },
                      course: true,
                      teacher: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      })

      return c.json({
        quizAttempts,
        assignmentSubmissions,
      })
    } else if (user.role === "ADMIN") {
      // Admin puede ver todo
      const quizAttempts = await prisma.quizAttempt.findMany({
        where: {
          isSubmitted: true,
          quiz: {
            subject: {
              ...(levelId && { levelId }),
              courseSubjects: {
                some: {
                  ...(courseId && {
                    course: {
                      id: courseId,
                    },
                  }),
                },
              },
            },
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quiz: {
            include: {
              subject: {
                include: {
                  courseSubjects: {
                    include: {
                      course: true,
                      teacher: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                  level: {
                    include: {
                      studyPlan: {
                        select: { id: true, name: true, code: true },
                      },
                    },
                  },
                },
              },
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      })

      const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
        where: {
          assignment: {
            assignmentCourseSubjects: {
              some: {
                courseSubject: {
                  ...(levelId && {
                    subject: {
                      levelId,
                    },
                  }),
                  ...(courseId && {
                    course: {
                      id: courseId,
                    },
                  }),
                },
              },
            },
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            include: {
              assignmentCourseSubjects: {
                include: {
                  courseSubject: {
                    include: {
                      subject: {
                        include: {
                          level: {
                            include: {
                              studyPlan: {
                                select: { id: true, name: true, code: true },
                              },
                            },
                          },
                        },
                      },
                      course: true,
                      teacher: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      })

      return c.json({
        quizAttempts,
        assignmentSubmissions,
      })
    }

    return c.json({ message: "Rol no autorizado" }, 403)
  })

  .patch("/quiz", zValidator("json", updateQuizGradeSchema), async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { attemptId, answerId, points, isCorrect } = c.req.valid("json")

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return c.json({ message: "No tienes permiso para modificar calificaciones" }, 403)
    }

    // Verificar que el intento existe
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            subject: {
              include: {
                courseSubjects: {
                  where: user.role === "TEACHER" ? {
                    teacherId: user.sub,
                  } : undefined,
                },
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!attempt) {
      return c.json({ message: "Intento de quiz no encontrado" }, 404)
    }

    // Verificar permisos de profesor
    if (user.role === "TEACHER") {
      const hasAccess = attempt.quiz.subject.courseSubjects.some(
        (cs) => cs.teacherId === user.sub
      )
      if (!hasAccess) {
        return c.json({ message: "No tienes permiso para modificar este quiz" }, 403)
      }
    }

    // Actualizar la respuesta
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        points,
        isCorrect,
        needsManualReview: false,
      },
    })

    // Recalcular el score del intento
    const allAnswers = await prisma.answer.findMany({
      where: { attemptId },
    })

    const totalScore = allAnswers.reduce((sum, answer) => {
      return sum + (answer.points || 0)
    }, 0)

    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score: totalScore,
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    return c.json({ attempt: updatedAttempt, answer: updatedAnswer })
  })

  .patch("/assignment", zValidator("json", updateAssignmentGradeSchema), async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { submissionId, grade, feedback } = c.req.valid("json")

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return c.json({ message: "No tienes permiso para modificar calificaciones" }, 403)
    }

    // Verificar que la entrega existe
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            assignmentCourseSubjects: {
              include: {
                courseSubject: true,
              },
            },
          },
        },
      },
    })

    if (!submission) {
      return c.json({ message: "Entrega no encontrada" }, 404)
    }

    // Verificar permisos de profesor
    if (user.role === "TEACHER") {
      const hasAccess = submission.assignment.assignmentCourseSubjects.some(
        (acs) => acs.courseSubject?.teacherId === user.sub
      )
      if (!hasAccess) {
        return c.json({ message: "No tienes permiso para modificar esta entrega" }, 403)
      }
    }

    // Actualizar la calificación
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
      },
    })

    return c.json({ submission: updatedSubmission })
  })

export default app
