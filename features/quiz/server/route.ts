import { Hono } from "hono"
import { format } from "date-fns"
import { zValidator } from "@hono/zod-validator"
import auth from "@/lib/middlewares/auth-middleware"
import {
  createQuizSchema,
  updateQuizSchema,
  startQuizAttemptSchema,
  submitAnswerSchema,
  submitQuizAttemptSchema,
  correctAnswerSchema,
  correctAttemptSchema,
} from "../schemas"
import { createNotifications } from "@/features/notification/api/create-notification"

const app = new Hono()
  .use("*", auth)
  
  // Obtener cuestionarios de una materia
  .get("/:subjectId", async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { subjectId } = c.req.param()

    try {
      // Verificar acceso a la materia
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
          courseSubjects: {
            include: {
              course: {
                include: {
                  enrollments: {
                    where: { studentId: user.sub },
                  },
                },
              },
            },
          },
        },
      })

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404)
      }

      // Verificar permisos
      let hasAccess = false
      if (user.role === "ADMIN") {
        hasAccess = true
      } else if (user.role === "TEACHER") {
        const isTeacherOfSubject = subject.courseSubjects.some(
          (cs) => cs.teacherId === user.sub
        )
        hasAccess = isTeacherOfSubject
      } else if (user.role === "STUDENT") {
        // Verificar si el estudiante está inscrito en un curso del mismo nivel que la materia
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: user.sub,
            status: "ACTIVE",
            course: {
              levelId: subject.levelId,
            },
          },
        })
        hasAccess = !!enrollment
      }

      if (!hasAccess) {
        return c.json(
          { message: "No tienes permiso para ver esta materia" },
          403
        )
      }

      // Obtener cuestionarios
      const quizzes = await prisma.quiz.findMany({
        where: { subjectId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          questions: {
            include: {
              options: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          attempts: user.role === "STUDENT" ? {
            where: { studentId: user.sub },
            orderBy: { startedAt: "desc" },
            take: 1,
          } : undefined,
        },
        orderBy: { createdAt: "desc" },
      })

      return c.json({ quizzes }, 200)
    } catch (error) {
      console.error(error)
      return c.json({ message: "Error al obtener cuestionarios" }, 500)
    }
  })

  // Obtener un cuestionario específico
  .get("/detail/:id", async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { id } = c.req.param()

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
          subject: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          questions: {
            include: {
              options: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      })

      if (!quiz) {
        return c.json({ message: "Cuestionario no encontrado" }, 404)
      }

      // Verificar acceso
      const subject = await prisma.subject.findUnique({
        where: { id: quiz.subjectId },
        include: {
          courseSubjects: {
            include: {
              course: {
                include: {
                  enrollments: {
                    where: { studentId: user.sub },
                  },
                },
              },
            },
          },
        },
      })

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404)
      }

      let hasAccess = false
      if (user.role === "ADMIN") {
        hasAccess = true
      } else if (user.role === "TEACHER") {
        const isTeacherOfSubject = subject.courseSubjects.some(
          (cs) => cs.teacherId === user.sub
        )
        hasAccess = isTeacherOfSubject
      } else if (user.role === "STUDENT") {
        const isEnrolled = subject.courseSubjects.some(
          (cs) => cs.course.enrollments.length > 0
        )
        hasAccess = isEnrolled
      }

      if (!hasAccess) {
        return c.json(
          { message: "No tienes permiso para ver este cuestionario" },
          403
        )
      }

      return c.json({ quiz }, 200)
    } catch (error) {
      console.error(error)
      return c.json({ message: "Error al obtener el cuestionario" }, 500)
    }
  })

  // Crear cuestionario
  .post(
    "/",
    zValidator("json", createQuizSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        )
      }
    }),
    async (c) => {
      const prisma = c.get("prisma")
      const user = c.get("user")
      const data = c.req.valid("json")

      try {
        // Verificar que el usuario es profesor o admin
        if (user.role !== "TEACHER" && user.role !== "ADMIN") {
          return c.json(
            { message: "Solo los profesores pueden crear cuestionarios" },
            403
          )
        }

        // Verificar que el profesor está asignado a esta materia
        if (user.role === "TEACHER") {
          const assignment = await prisma.courseSubject.findFirst({
            where: {
              subjectId: data.subjectId,
              teacherId: user.sub,
            },
          })

          if (!assignment) {
            return c.json(
              { message: "No estás asignado a esta materia" },
              403
            )
          }
        }

        // Crear el cuestionario con sus preguntas y opciones
        const quiz = await prisma.quiz.create({
          data: {
            title: data.title,
            description: data.description,
            timeLimit: data.timeLimit,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            allowReview: data.allowReview,
            allowRetries: data.allowRetries,
            subjectId: data.subjectId,
            createdById: user.sub,
            questions: {
              create: data.questions.map((q) => ({
                statement: q.statement,
                type: q.type,
                hasAutoCorrection: q.hasAutoCorrection,
                correctTextAnswer: q.correctTextAnswer || null,
                points: q.points,
                order: q.order,
                options: q.options
                  ? {
                      create: q.options.map((opt) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        order: opt.order,
                      })),
                    }
                  : undefined,
              })),
            },
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            subject: {
              include: {
                courseSubjects: {
                  where: user.role === "TEACHER" ? { teacherId: user.sub } : undefined,
                  include: {
                    course: {
                      include: {
                        enrollments: {
                          where: { status: "ACTIVE" },
                          select: {
                            studentId: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            questions: {
              include: {
                options: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        })

        // Emitir notificaciones a todos los estudiantes de los cursos con esta materia
        try {
          const notificationsToCreate: Array<{
            courseSubjectId: string;
            studentIds: string[];
          }> = [];

          quiz.subject.courseSubjects.forEach((cs) => {
            const studentIds = cs.course.enrollments.map((e) => e.studentId);
            if (studentIds.length > 0) {
              notificationsToCreate.push({
                courseSubjectId: cs.id,
                studentIds,
              });
            }
          });

          // Crear notificaciones para cada curso-materia
          for (const notif of notificationsToCreate) {
            await createNotifications({
              prisma,
              type: "QUIZ",
              title: `Nuevo Cuestionario: ${quiz.title}`,
              message: `El profesor ha habilitado un nuevo cuestionario. Fecha de cierre: ${format(new Date(quiz.endDate), "PPp")}`,
              relatedId: quiz.id,
              courseSubjectId: notif.courseSubjectId,
              studentIds: notif.studentIds,
            });
          }
        } catch (notificationError) {
          console.error("Error al crear notificaciones:", notificationError);
          // No fallar la creación del quiz si falla la notificación
        }

        return c.json(
          { message: "Cuestionario creado exitosamente", quiz },
          201
        )
      } catch (error) {
        console.error(error)
        return c.json({ message: "Error al crear cuestionario" }, 500)
      }
    }
  )

  // Actualizar cuestionario
  .patch(
    "/:id",
    zValidator("json", updateQuizSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        )
      }
    }),
    async (c) => {
      const prisma = c.get("prisma")
      const user = c.get("user")
      const { id } = c.req.param()
      const data = c.req.valid("json")

      try {
        const quiz = await prisma.quiz.findUnique({
          where: { id },
        })

        if (!quiz) {
          return c.json({ message: "Cuestionario no encontrado" }, 404)
        }

        // Verificar permisos
        if (user.role !== "ADMIN" && quiz.createdById !== user.sub) {
          return c.json(
            { message: "No tienes permiso para editar este cuestionario" },
            403
          )
        }

        // Actualizar
        const updateData: any = {}
        if (data.title !== undefined) updateData.title = data.title
        if (data.description !== undefined) updateData.description = data.description
        if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit
        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
        if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
        if (data.allowReview !== undefined) updateData.allowReview = data.allowReview
        if (data.allowRetries !== undefined) updateData.allowRetries = data.allowRetries

        const updatedQuiz = await prisma.quiz.update({
          where: { id },
          data: updateData,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            questions: {
              include: {
                options: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        })

        return c.json({
          message: "Cuestionario actualizado exitosamente",
          quiz: updatedQuiz,
        })
      } catch (error) {
        console.error(error)
        return c.json({ message: "Error al actualizar cuestionario" }, 500)
      }
    }
  )

  // Eliminar cuestionario
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { id } = c.req.param()

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
      })

      if (!quiz) {
        return c.json({ message: "Cuestionario no encontrado" }, 404)
      }

      // Verificar permisos
      if (user.role !== "ADMIN" && quiz.createdById !== user.sub) {
        return c.json(
          { message: "No tienes permiso para eliminar este cuestionario" },
          403
        )
      }

      await prisma.quiz.delete({
        where: { id },
      })

      return c.json({ message: "Cuestionario eliminado exitosamente" })
    } catch (error) {
      console.error(error)
      return c.json({ message: "Error al eliminar cuestionario" }, 500)
    }
  })

  // Iniciar intento
  .post(
    "/start",
    zValidator("json", startQuizAttemptSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        )
      }
    }),
    async (c) => {
      const prisma = c.get("prisma")
      const user = c.get("user")
      const data = c.req.valid("json")

      try {
        // Verificar que es estudiante
        if (user.role !== "STUDENT") {
          return c.json(
            { message: "Solo los estudiantes pueden realizar cuestionarios" },
            403
          )
        }

        // Obtener el cuestionario
        const quiz = await prisma.quiz.findUnique({
          where: { id: data.quizId },
          include: {
            subject: {
              include: {
                courseSubjects: {
                  include: {
                    course: {
                      include: {
                        enrollments: {
                          where: { studentId: user.sub },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        })

        if (!quiz) {
          return c.json({ message: "Cuestionario no encontrado" }, 404)
        }

        // Verificar disponibilidad
        const now = new Date()
        const startDate = new Date(quiz.startDate)
        const endDate = new Date(quiz.endDate)

        if (now < startDate) {
          return c.json(
            { message: "El cuestionario aún no está disponible" },
            400
          )
        }

        if (now > endDate) {
          return c.json(
            { message: "El cuestionario ya no está disponible" },
            400
          )
        }

        // Verificar acceso a la materia
        const isEnrolled = quiz.subject.courseSubjects.some(
          (cs) => cs.course.enrollments.length > 0
        )

        if (!isEnrolled) {
          return c.json(
            { message: "No tienes permiso para realizar este cuestionario" },
            403
          )
        }

        // Verificar si ya existe un intento activo
        const activeAttempt = await prisma.quizAttempt.findFirst({
          where: {
            quizId: data.quizId,
            studentId: user.sub,
            isSubmitted: false,
          },
          orderBy: { startedAt: "desc" },
        })

        if (activeAttempt) {
          // Si hay un intento activo, devolverlo
          const attemptWithDetails = await prisma.quizAttempt.findUnique({
            where: { id: activeAttempt.id },
            include: {
              quiz: {
                include: {
                  questions: {
                    include: {
                      options: {
                        orderBy: { order: "asc" },
                      },
                    },
                    orderBy: { order: "asc" },
                  },
                },
              },
              answers: {
                include: {
                  selectedOptions: {
                    include: {
                      option: true,
                    },
                  },
                },
              },
            },
          })

          return c.json({ attempt: attemptWithDetails }, 200)
        }

        // Verificar reintentos
        if (!quiz.allowRetries) {
          const previousAttempt = await prisma.quizAttempt.findFirst({
            where: {
              quizId: data.quizId,
              studentId: user.sub,
              isSubmitted: true,
            },
          })

          if (previousAttempt) {
            return c.json(
              { message: "Ya has realizado este cuestionario" },
              400
            )
          }
        }

        // Crear nuevo intento
        const attempt = await prisma.quizAttempt.create({
          data: {
            quizId: data.quizId,
            studentId: user.sub,
            startedAt: new Date(),
          },
          include: {
            quiz: {
              include: {
                questions: {
                  include: {
                    options: {
                      orderBy: { order: "asc" },
                    },
                  },
                  orderBy: { order: "asc" },
                },
              },
            },
            answers: {
              include: {
                selectedOptions: {
                  include: {
                    option: true,
                  },
                },
              },
            },
          },
        })

        return c.json({ attempt }, 201)
      } catch (error) {
        console.error(error)
        return c.json({ message: "Error al iniciar el cuestionario" }, 500)
      }
    }
  )

  // Obtener intento
  .get("/attempt/:id", async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { id } = c.req.param()

    try {
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id },
        include: {
          quiz: {
            include: {
              questions: {
                include: {
                  options: {
                    orderBy: { order: "asc" },
                  },
                },
                orderBy: { order: "asc" },
              },
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          answers: {
            include: {
              question: {
                include: {
                  options: {
                    orderBy: { order: "asc" },
                  },
                },
              },
              selectedOptions: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
      })

      if (!attempt) {
        return c.json({ message: "Intento no encontrado" }, 404)
      }

      // Verificar permisos
      if (user.role === "STUDENT" && attempt.studentId !== user.sub) {
        return c.json(
          { message: "No tienes permiso para ver este intento" },
          403
        )
      }

      // Si es profesor, verificar que es el creador del cuestionario
      if (user.role === "TEACHER") {
        const quiz = await prisma.quiz.findUnique({
          where: { id: attempt.quizId },
        })

        if (!quiz || quiz.createdById !== user.sub) {
          return c.json(
            { message: "No tienes permiso para ver este intento" },
            403
          )
        }
      }

      return c.json({ attempt }, 200)
    } catch (error) {
      console.error(error)
      return c.json({ message: "Error al obtener el intento" }, 500)
    }
  })

  // Enviar respuesta
  .post(
    "/answer",
    zValidator("json", submitAnswerSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        )
      }
    }),
    async (c) => {
      const prisma = c.get("prisma")
      const user = c.get("user")
      const data = c.req.valid("json")

      try {
        // Verificar que es estudiante
        if (user.role !== "STUDENT") {
          return c.json(
            { message: "Solo los estudiantes pueden enviar respuestas" },
            403
          )
        }

        // Obtener el intento
        const attempt = await prisma.quizAttempt.findUnique({
          where: { id: data.attemptId },
          include: {
            quiz: true,
          },
        })

        if (!attempt) {
          return c.json({ message: "Intento no encontrado" }, 404)
        }

        // Verificar que el intento pertenece al estudiante
        if (attempt.studentId !== user.sub) {
          return c.json(
            { message: "No tienes permiso para modificar este intento" },
            403
          )
        }

        // Verificar que no está enviado
        if (attempt.isSubmitted) {
          return c.json(
            { message: "Este cuestionario ya fue enviado" },
            400
          )
        }

        // Verificar disponibilidad
        const now = new Date()
        const endDate = new Date(attempt.quiz.endDate)
        if (now > endDate) {
          return c.json(
            { message: "El tiempo del cuestionario ha expirado" },
            400
          )
        }

        // Obtener la pregunta
        const question = await prisma.question.findUnique({
          where: { id: data.questionId },
          select: {
            id: true,
            statement: true,
            type: true,
            hasAutoCorrection: true,
            correctTextAnswer: true,
            points: true,
            order: true,
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: true,
                order: true,
              },
            },
          },
        })

        if (!question) {
          return c.json({ message: "Pregunta no encontrada" }, 404)
        }

        // Buscar o crear la respuesta
        let answer = await prisma.answer.findUnique({
          where: {
            questionId_attemptId: {
              questionId: data.questionId,
              attemptId: data.attemptId,
            },
          },
          include: {
            selectedOptions: true,
          },
        })

        if (answer) {
          // Actualizar respuesta existente
          const existingAnswer = answer
          await prisma.answerOption.deleteMany({
            where: { answerId: existingAnswer.id },
          })

          if (data.selectedOptionIds && data.selectedOptionIds.length > 0) {
            await prisma.answerOption.createMany({
              data: data.selectedOptionIds.map((optionId) => ({
                answerId: existingAnswer.id,
                optionId,
              })),
            })
          }

          answer = await prisma.answer.update({
            where: { id: existingAnswer.id },
            data: {
              textAnswer: data.textAnswer || null,
            },
            include: {
              selectedOptions: {
                include: {
                  option: true,
                },
              },
            },
          })
        } else {
          // Crear nueva respuesta
          const answerData: any = {
            questionId: data.questionId,
            attemptId: data.attemptId,
            textAnswer: data.textAnswer || null,
            needsManualReview: !question.hasAutoCorrection,
          }

          const newAnswer = await prisma.answer.create({
            data: answerData,
            include: {
              selectedOptions: {
                include: {
                  option: true,
                },
              },
            },
          })

          answer = newAnswer

          if (data.selectedOptionIds && data.selectedOptionIds.length > 0) {
            await prisma.answerOption.createMany({
              data: data.selectedOptionIds.map((optionId) => ({
                answerId: newAnswer.id,
                optionId,
              })),
            })

            answer = await prisma.answer.findUnique({
              where: { id: newAnswer.id },
              include: {
                selectedOptions: {
                  include: {
                    option: true,
                  },
                },
              },
            }) as typeof answer
          }
        }

        // Si tiene corrección automática, corregir
        if (question.hasAutoCorrection) {
          let isCorrect = false
          let points = 0

          if (question.type === "TEXT") {
            // Para respuesta abierta, comparación exacta (case-insensitive, trim)
            const correctText = (question as any).correctTextAnswer
            if (correctText && data.textAnswer) {
              const correctAnswer = correctText.trim().toLowerCase()
              const studentAnswer = data.textAnswer.trim().toLowerCase()
              isCorrect = correctAnswer === studentAnswer
              points = isCorrect ? question.points : 0
            } else {
              // Si no hay respuesta correcta configurada, requiere corrección manual
              isCorrect = false
              points = 0
            }
          } else if (question.type === "SINGLE_CHOICE") {
            // Una sola opción correcta
            const correctOption = question.options.find((opt) => opt.isCorrect)
            if (correctOption && data.selectedOptionIds && data.selectedOptionIds.length === 1) {
              isCorrect = data.selectedOptionIds[0] === correctOption.id
              points = isCorrect ? question.points : 0
            }
          } else if (question.type === "MULTIPLE_CHOICE") {
            // Varias opciones correctas - todas deben estar seleccionadas y ninguna incorrecta
            const correctOptions = question.options.filter((opt) => opt.isCorrect)
            const incorrectOptions = question.options.filter((opt) => !opt.isCorrect)

            if (data.selectedOptionIds) {
              const selectedCorrect = data.selectedOptionIds.filter((id) =>
                correctOptions.some((opt) => opt.id === id)
              ).length
              const selectedIncorrect = data.selectedOptionIds.filter((id) =>
                incorrectOptions.some((opt) => opt.id === id)
              ).length

              isCorrect =
                selectedCorrect === correctOptions.length &&
                selectedIncorrect === 0 &&
                data.selectedOptionIds.length === correctOptions.length
              points = isCorrect ? question.points : 0
            }
          }

          answer = await prisma.answer.update({
            where: { id: answer.id },
            data: {
              isCorrect,
              points,
              needsManualReview: false,
            },
            include: {
              selectedOptions: {
                include: {
                  option: true,
                },
              },
            },
          })
        }

        return c.json({ answer }, 200)
      } catch (error) {
        console.error(error)
        return c.json({ message: "Error al enviar la respuesta" }, 500)
      }
    }
  )

  // Enviar cuestionario completo
  .post(
    "/attempt/:id/submit",
    zValidator("json", submitQuizAttemptSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        )
      }
    }),
    async (c) => {
      const prisma = c.get("prisma")
      const user = c.get("user")
      const { id } = c.req.param()
      const data = c.req.valid("json")

      try {
        // Verificar que es estudiante
        if (user.role !== "STUDENT") {
          return c.json(
            { message: "Solo los estudiantes pueden enviar cuestionarios" },
            403
          )
        }

        // Obtener el intento
        const attempt = await prisma.quizAttempt.findUnique({
          where: { id },
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
            answers: {
              include: {
                question: true,
                selectedOptions: true,
              },
            },
          },
        })

        if (!attempt) {
          return c.json({ message: "Intento no encontrado" }, 404)
        }

        // Verificar que el intento pertenece al estudiante
        if (attempt.studentId !== user.sub) {
          return c.json(
            { message: "No tienes permiso para enviar este intento" },
            403
          )
        }

        // Verificar que no está enviado
        if (attempt.isSubmitted) {
          return c.json(
            { message: "Este cuestionario ya fue enviado" },
            400
          )
        }

        // Calcular puntaje total
        let totalScore = 0
        let allCorrected = true

        for (const answer of attempt.answers) {
          if (answer.points !== null) {
            totalScore += answer.points
          } else {
            allCorrected = false
          }
        }

        // Actualizar intento
        const updatedAttempt = await prisma.quizAttempt.update({
          where: { id },
          data: {
            isSubmitted: true,
            submittedAt: new Date(),
            timeRemaining: data.timeRemaining || null,
            score: allCorrected ? totalScore : null,
          },
          include: {
            quiz: {
              include: {
                questions: {
                  include: {
                    options: {
                      orderBy: { order: "asc" },
                    },
                  },
                  orderBy: { order: "asc" },
                },
              },
            },
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            answers: {
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: { order: "asc" },
                    },
                  },
                },
                selectedOptions: {
                  include: {
                    option: true,
                  },
                },
              },
            },
          },
        })

        return c.json({
          message: "Cuestionario enviado exitosamente",
          attempt: updatedAttempt,
        })
      } catch (error) {
        console.error(error)
        return c.json({ message: "Error al enviar el cuestionario" }, 500)
      }
    }
  )

  // Obtener intentos de un cuestionario (para profesor)
  .get("/:id/attempts", async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { id } = c.req.param()

    try {
      // Verificar que es profesor o admin
      if (user.role !== "TEACHER" && user.role !== "ADMIN") {
        return c.json(
          { message: "Solo los profesores pueden ver los intentos" },
          403
        )
      }

      const quiz = await prisma.quiz.findUnique({
        where: { id },
      })

      if (!quiz) {
        return c.json({ message: "Cuestionario no encontrado" }, 404)
      }

      // Verificar permisos
      if (user.role !== "ADMIN" && quiz.createdById !== user.sub) {
        return c.json(
          { message: "No tienes permiso para ver los intentos de este cuestionario" },
          403
        )
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId: id },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              dni: true,
            },
          },
          answers: {
            include: {
              question: {
                include: {
                  options: {
                    orderBy: { order: "asc" },
                  },
                },
              },
              selectedOptions: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
        orderBy: { startedAt: "desc" },
      })

      return c.json({ attempts }, 200)
    } catch (error) {
      console.error(error)
      return c.json({ message: "Error al obtener los intentos" }, 500)
    }
  })

  // Corregir manualmente una respuesta
  .post(
    "/answer/correct",
    zValidator("json", correctAnswerSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        )
      }
    }),
    async (c) => {
      const prisma = c.get("prisma")
      const user = c.get("user")
      const data = c.req.valid("json")

      try {
        // Verificar que es profesor o admin
        if (user.role !== "TEACHER" && user.role !== "ADMIN") {
          return c.json(
            { message: "Solo los profesores pueden corregir respuestas" },
            403
          )
        }

        const answer = await prisma.answer.findUnique({
          where: { id: data.answerId },
          include: {
            attempt: {
              include: {
                quiz: true,
              },
            },
          },
        })

        if (!answer) {
          return c.json({ message: "Respuesta no encontrada" }, 404)
        }

        // Verificar permisos
        if (user.role !== "ADMIN" && answer.attempt.quiz.createdById !== user.sub) {
          return c.json(
            { message: "No tienes permiso para corregir esta respuesta" },
            403
          )
        }

        // Actualizar respuesta
        const updatedAnswer = await prisma.answer.update({
          where: { id: data.answerId },
          data: {
            isCorrect: data.isCorrect,
            points: data.points,
            needsManualReview: false,
          },
        })

        // Recalcular puntaje del intento
        const attempt = await prisma.quizAttempt.findUnique({
          where: { id: answer.attemptId },
          include: {
            answers: true,
          },
        })

        if (attempt) {
          let totalScore = 0
          let allCorrected = true

          for (const ans of attempt.answers) {
            if (ans.points !== null) {
              totalScore += ans.points
            } else {
              allCorrected = false
            }
          }

          await prisma.quizAttempt.update({
            where: { id: attempt.id },
            data: {
              score: allCorrected ? totalScore : null,
            },
          })
        }

        return c.json({
          message: "Respuesta corregida exitosamente",
          answer: updatedAnswer,
        })
      } catch (error) {
        console.error(error)
        return c.json({ message: "Error al corregir la respuesta" }, 500)
      }
    }
  )

  // Ver revisión (si está habilitada)
  .get("/attempt/:id/review", async (c) => {
    const prisma = c.get("prisma")
    const user = c.get("user")
    const { id } = c.req.param()

    try {
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id },
        include: {
          quiz: {
            include: {
              questions: {
                include: {
                  options: {
                    orderBy: { order: "asc" },
                  },
                },
                orderBy: { order: "asc" },
              },
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          answers: {
            include: {
              question: {
                include: {
                  options: {
                    orderBy: { order: "asc" },
                  },
                },
              },
              selectedOptions: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
      })

      if (!attempt) {
        return c.json({ message: "Intento no encontrado" }, 404)
      }

      // Verificar que el intento pertenece al estudiante
      if (user.role === "STUDENT" && attempt.studentId !== user.sub) {
        return c.json(
          { message: "No tienes permiso para ver este intento" },
          403
        )
      }

      // Verificar que está enviado
      if (!attempt.isSubmitted) {
        return c.json(
          { message: "El cuestionario aún no ha sido enviado" },
          400
        )
      }

      // Verificar que la revisión está habilitada
      if (!attempt.quiz.allowReview && user.role === "STUDENT") {
        return c.json(
          { message: "La revisión no está habilitada para este cuestionario" },
          403
        )
      }

      return c.json({ attempt }, 200)
    } catch (error) {
      console.error(error)
      return c.json({ message: "Error al obtener la revisión" }, 500)
    }
  })

export default app
