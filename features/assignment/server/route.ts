import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import auth from "@/lib/middlewares/auth-middleware";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeAssignmentSchema,
} from "../schemas";
import { createNotifications } from "@/features/notification/api/create-notification";
import { format } from "date-fns";

const app = new Hono()
  .use("*", auth)
  // Obtener una entrega específica
  .get("/detail/:id", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { id } = c.req.param();

    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: {
          assignmentCourseSubjects: {
            include: {
              courseSubject: {
                include: {
                  course: {
                    include: {
                      enrollments: user.role === "STUDENT"
                        ? {
                            where: { studentId: user.sub, status: "ACTIVE" },
                          }
                        : undefined,
                    },
                  },
                  subject: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          submissions: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  dni: true,
                  email: true,
                },
              },
            },
            orderBy: { submittedAt: "desc" },
          },
        },
      });

      if (!assignment) {
        return c.json({ message: "Entrega no encontrada" }, 404);
      }

      // Verificar permisos
      let hasAccess = false;
      if (user.role === "ADMIN") {
        hasAccess = true;
      } else if (user.role === "TEACHER") {
        // Verificar si es profesor de alguno de los cursos
        hasAccess = assignment.assignmentCourseSubjects.some(
          (acs) => acs.courseSubject.teacherId === user.sub
        );
      } else if (user.role === "STUDENT") {
        // Verificar si está matriculado en alguno de los cursos
        hasAccess = assignment.assignmentCourseSubjects.some((acs) =>
          acs.courseSubject.course.enrollments.some(
            (e) => e.studentId === user.sub
          )
        );
      }

      if (!hasAccess) {
        return c.json(
          { message: "No tienes permiso para ver esta entrega" },
          403
        );
      }

      return c.json({ assignment }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener la entrega" }, 500);
    }
  })
  // Obtener entregas de una materia (filtradas por curso para estudiantes)
  .get("/subject/:subjectId", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { subjectId } = c.req.param();

    try {
      // Verificar que la materia existe
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
          courseSubjects: {
            include: {
              course: {
                include: {
                  enrollments: user.role === "STUDENT"
                    ? {
                        where: { studentId: user.sub, status: "ACTIVE" },
                      }
                    : undefined,
                },
              },
            },
          },
        },
      });

      if (!subject) {
        return c.json({ message: "Materia no encontrada" }, 404);
      }

      // Para estudiantes: obtener su curso
      let studentCourseSubjectIds: string[] = [];
      if (user.role === "STUDENT") {
        // Obtener el curso del estudiante
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: user.sub,
            status: "ACTIVE",
          },
          include: {
            course: {
              include: {
                courseSubjects: {
                  where: { subjectId },
                },
              },
            },
          },
        });

        if (enrollment) {
          studentCourseSubjectIds = enrollment.course.courseSubjects.map(
            (cs) => cs.id
          );
        }

        if (studentCourseSubjectIds.length === 0) {
          return c.json({ assignments: [] }, 200);
        }
      }

      // Para profesores: obtener todos los courseSubjects donde es profesor
      let teacherCourseSubjectIds: string[] = [];
      if (user.role === "TEACHER") {
        teacherCourseSubjectIds = subject.courseSubjects
          .filter((cs) => cs.teacherId === user.sub)
          .map((cs) => cs.id);
      }

      // Construir el where clause
      let whereClause: any = {
        assignmentCourseSubjects: {
          some: {},
        },
      };

      if (user.role === "STUDENT") {
        whereClause.assignmentCourseSubjects.some = {
          courseSubjectId: {
            in: studentCourseSubjectIds,
          },
        };
      } else if (user.role === "TEACHER") {
        whereClause.assignmentCourseSubjects.some = {
          courseSubjectId: {
            in: teacherCourseSubjectIds,
          },
        };
      }

      // Obtener entregas
      const assignments = await prisma.assignment.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignmentCourseSubjects: {
            include: {
              courseSubject: {
                include: {
                  course: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          submissions: user.role === "STUDENT"
            ? {
                where: { studentId: user.sub },
                take: 1,
                orderBy: { submittedAt: "desc" },
              }
            : {
                include: {
                  student: {
                    select: {
                      id: true,
                      name: true,
                      dni: true,
                      email: true,
                    },
                  },
                },
              },
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({ assignments }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al obtener entregas" }, 500);
    }
  })
  // Crear entrega (solo profesores)
  .post(
    "/",
    zValidator("json", createAssignmentSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const user = c.get("user");
      const data = c.req.valid("json");

      try {
        // Verificar que el usuario es profesor o admin
        if (user.role !== "TEACHER" && user.role !== "ADMIN") {
          return c.json(
            { message: "Solo los profesores pueden crear entregas" },
            403
          );
        }

        // Verificar que el profesor está asignado a todos los cursos-materias seleccionados
        if (user.role === "TEACHER") {
          const courseSubjects = await prisma.courseSubject.findMany({
            where: {
              id: { in: data.courseSubjectIds },
              teacherId: user.sub,
            },
          });

          if (courseSubjects.length !== data.courseSubjectIds.length) {
            return c.json(
              { message: "No estás asignado a uno o más de los cursos seleccionados" },
              403
            );
          }
        }

        // Obtener información de los cursos-materias para las notificaciones
        const courseSubjects = await prisma.courseSubject.findMany({
          where: {
            id: { in: data.courseSubjectIds },
          },
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
            subject: {
              select: {
                id: true,
              },
            },
          },
        });

        // Crear la entrega con relaciones a múltiples cursos
        const assignment = await prisma.assignment.create({
          data: {
            title: data.title,
            description: data.description,
            dueDate: new Date(data.dueDate),
            hasGrade: data.hasGrade,
            createdById: user.sub,
            assignmentCourseSubjects: {
              create: data.courseSubjectIds.map((courseSubjectId) => ({
                courseSubjectId,
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
            assignmentCourseSubjects: {
              include: {
                courseSubject: {
                  include: {
                    course: true,
                    subject: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Obtener el subjectId para la respuesta
        const subjectId = assignment.assignmentCourseSubjects[0]?.courseSubject.subject.id;
        const assignmentWithSubjectId = {
          ...assignment,
          subjectId,
        };

        // Emitir notificaciones a todos los estudiantes de los cursos seleccionados
        try {
          const studentIdsMap = new Map<string, string>(); // studentId -> courseSubjectId
          
          courseSubjects.forEach((cs) => {
            cs.course.enrollments.forEach((enrollment) => {
              studentIdsMap.set(enrollment.studentId, cs.id);
            });
          });

          // Crear notificaciones para cada estudiante con su courseSubjectId correspondiente
          for (const [studentId, courseSubjectId] of studentIdsMap.entries()) {
            await createNotifications({
              prisma,
              type: "ASSIGNMENT",
              title: `Nueva Entrega: ${assignment.title}`,
              message: `El profesor ha habilitado una nueva entrega. Fecha de entrega: ${format(new Date(assignment.dueDate), "PPp")}`,
              relatedId: assignment.id,
              courseSubjectId,
              studentIds: [studentId],
            });
          }
        } catch (notificationError) {
          console.error("Error al crear notificaciones:", notificationError);
          // No fallar la creación de la entrega si falla la notificación
        }

        return c.json(
          { message: "Entrega creada exitosamente", assignment: assignmentWithSubjectId },
          201
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al crear la entrega" }, 500);
      }
    }
  )
  // Actualizar entrega (solo profesores)
  .put(
    "/:id",
    zValidator("json", updateAssignmentSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const user = c.get("user");
      const { id } = c.req.param();
      const data = c.req.valid("json");

      try {
        // Verificar que la entrega existe
        const assignment = await prisma.assignment.findUnique({
          where: { id },
          include: {
            assignmentCourseSubjects: {
              include: {
                courseSubject: true,
              },
            },
          },
        });

        if (!assignment) {
          return c.json({ message: "Entrega no encontrada" }, 404);
        }

        // Verificar permisos: solo el creador o un admin pueden editar
        if (
          user.role !== "ADMIN" &&
          assignment.createdById !== user.sub
        ) {
          return c.json(
            { message: "No tienes permiso para editar esta entrega" },
            403
          );
        }

        // Si se están actualizando los cursos, verificar permisos
        if (data.courseSubjectIds && data.courseSubjectIds.length > 0) {
          if (user.role === "TEACHER") {
            const courseSubjects = await prisma.courseSubject.findMany({
              where: {
                id: { in: data.courseSubjectIds },
                teacherId: user.sub,
              },
            });

            if (courseSubjects.length !== data.courseSubjectIds.length) {
              return c.json(
                { message: "No estás asignado a uno o más de los cursos seleccionados" },
                403
              );
            }
          }
        }

        // Preparar datos de actualización
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
        if (data.hasGrade !== undefined) updateData.hasGrade = data.hasGrade;

        // Si se actualizan los cursos, eliminar relaciones antiguas y crear nuevas
        if (data.courseSubjectIds && data.courseSubjectIds.length > 0) {
          // Eliminar relaciones antiguas
          await prisma.assignmentCourseSubject.deleteMany({
            where: { assignmentId: id },
          });

          // Crear nuevas relaciones
          updateData.assignmentCourseSubjects = {
            create: data.courseSubjectIds.map((courseSubjectId: string) => ({
              courseSubjectId,
            })),
          };
        }

        // Actualizar la entrega
        const updatedAssignment = await prisma.assignment.update({
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
            assignmentCourseSubjects: {
              include: {
                courseSubject: {
                  include: {
                    course: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    subject: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Obtener el subjectId de la entrega actualizada
        const subjectId = updatedAssignment.assignmentCourseSubjects[0]?.courseSubject.subject.id;

        // Agregar subjectId a la respuesta para invalidar queries
        const responseData = {
          ...updatedAssignment,
          subjectId,
        };

        return c.json({
          message: "Entrega actualizada exitosamente",
          assignment: responseData,
        });
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al actualizar la entrega" }, 500);
      }
    }
  )
  // Eliminar entrega (solo profesores)
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const user = c.get("user");
    const { id } = c.req.param();

    try {
      // Verificar que la entrega existe y obtener subjectId antes de eliminar
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: {
          assignmentCourseSubjects: {
            include: {
              courseSubject: {
                select: {
                  subjectId: true,
                },
              },
            },
            take: 1,
          },
        },
      });

      if (!assignment) {
        return c.json({ message: "Entrega no encontrada" }, 404);
      }

      // Verificar permisos: solo el creador o un admin pueden eliminar
      if (
        user.role !== "ADMIN" &&
        assignment.createdById !== user.sub
      ) {
        return c.json(
          { message: "No tienes permiso para eliminar esta entrega" },
          403
        );
      }

      const subjectId = assignment.assignmentCourseSubjects[0]?.courseSubject.subjectId;

      // Eliminar la entrega
      await prisma.assignment.delete({
        where: { id },
      });

      return c.json({ 
        message: "Entrega eliminada exitosamente",
        subjectId,
      });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Error al eliminar la entrega" }, 500);
    }
  })
  // Subir entrega del estudiante
  .post(
    "/submit",
    zValidator("json", submitAssignmentSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const user = c.get("user");
      const data = c.req.valid("json");

      try {
        // Verificar que el usuario es estudiante
        if (user.role !== "STUDENT") {
          return c.json(
            { message: "Solo los estudiantes pueden subir entregas" },
            403
          );
        }

        // Verificar que la entrega existe
        const assignment = await prisma.assignment.findUnique({
          where: { id: data.assignmentId },
          include: {
            assignmentCourseSubjects: {
              include: {
                courseSubject: {
                  include: {
                    course: {
                      include: {
                        enrollments: {
                          where: { studentId: user.sub, status: "ACTIVE" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!assignment) {
          return c.json({ message: "Entrega no encontrada" }, 404);
        }

        // Verificar que el estudiante está matriculado en alguno de los cursos
        const isEnrolled = assignment.assignmentCourseSubjects.some((acs) =>
          acs.courseSubject.course.enrollments.length > 0
        );

        if (!isEnrolled) {
          return c.json(
            { message: "No estás matriculado en ninguno de los cursos de esta entrega" },
            403
          );
        }

        // Verificar si ya existe una entrega del estudiante
        const existingSubmission = await prisma.assignmentSubmission.findUnique({
          where: {
            assignmentId_studentId: {
              assignmentId: data.assignmentId,
              studentId: user.sub,
            },
          },
        });

        let submission;
        if (existingSubmission) {
          // Actualizar entrega existente
          submission = await prisma.assignmentSubmission.update({
            where: { id: existingSubmission.id },
            data: {
              fileName: data.fileName,
              fileUrl: data.fileUrl,
              fileType: data.fileType,
              fileSize: data.fileSize,
              submittedAt: new Date(),
              grade: null, // Resetear calificación si se vuelve a subir
              feedback: null,
            },
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  dni: true,
                  email: true,
                },
              },
            },
          });
        } else {
          // Crear nueva entrega
          submission = await prisma.assignmentSubmission.create({
            data: {
              assignmentId: data.assignmentId,
              studentId: user.sub,
              fileName: data.fileName,
              fileUrl: data.fileUrl,
              fileType: data.fileType,
              fileSize: data.fileSize,
            },
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  dni: true,
                  email: true,
                },
              },
            },
          });
        }

        return c.json(
          {
            message: existingSubmission
              ? "Entrega actualizada exitosamente"
              : "Entrega subida exitosamente",
            submission,
          },
          201
        );
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al subir la entrega" }, 500);
      }
    }
  )
  // Calificar entrega (solo profesores)
  .post(
    "/grade",
    zValidator("json", gradeAssignmentSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { message: "Datos inválidos", errors: result.error.issues },
          400
        );
      }
    }),
    async (c) => {
      const prisma = c.get("prisma");
      const user = c.get("user");
      const data = c.req.valid("json");

      try {
        // Verificar que el usuario es profesor o admin
        if (user.role !== "TEACHER" && user.role !== "ADMIN") {
          return c.json(
            { message: "Solo los profesores pueden calificar entregas" },
            403
          );
        }

        // Verificar que la entrega existe
        const submission = await prisma.assignmentSubmission.findUnique({
          where: { id: data.submissionId },
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
        });

        if (!submission) {
          return c.json({ message: "Entrega no encontrada" }, 404);
        }

        // Verificar que la entrega permite calificación
        if (!submission.assignment.hasGrade) {
          return c.json(
            { message: "Esta entrega no permite calificación" },
            400
          );
        }

        // Verificar permisos: solo el profesor asignado o un admin pueden calificar
        if (user.role === "TEACHER") {
          const isTeacherOfAnyCourse = submission.assignment.assignmentCourseSubjects.some(
            (acs) => acs.courseSubject.teacherId === user.sub
          );
          
          if (!isTeacherOfAnyCourse) {
            return c.json(
              { message: "No estás asignado a esta materia" },
              403
            );
          }
        }

        // Actualizar calificación
        const updatedSubmission = await prisma.assignmentSubmission.update({
          where: { id: data.submissionId },
          data: {
            grade: data.grade ?? null,
            feedback: data.feedback ?? null,
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                dni: true,
                email: true,
              },
            },
          },
        });

        return c.json({
          message: "Entrega calificada exitosamente",
          submission: updatedSubmission,
        });
      } catch (error) {
        console.error(error);
        return c.json({ message: "Error al calificar la entrega" }, 500);
      }
    }
  );

export default app;
