import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes (en orden correcto por dependencias)
  await prisma.answerOption.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignmentCourseSubject.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.subjectResource.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseSubject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.level.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Datos existentes eliminados");

  // ========================================
  // PLANES DE ESTUDIO
  // ========================================

  const planJovenes = await prisma.studyPlan.create({
    data: {
      name: "Plan Jóvenes 4 años",
      code: "PJ4",
      description:
        "Plan de estudio diseñado para jóvenes de 14 a 17 años con una duración de 4 años",
      durationYears: 4,
      targetAudience: "Jóvenes 14-17 años",
      isActive: true,
    },
  });

  const planAdultos = await prisma.studyPlan.create({
    data: {
      name: "Plan Adultos 3 años",
      code: "PA3",
      description:
        "Plan de estudio acelerado para adultos con una duración de 3 años",
      durationYears: 3,
      targetAudience: "Adultos mayores de 18 años",
      isActive: true,
    },
  });

  console.log("✅ Planes de estudio creados");

  // ========================================
  // NIVELES - Plan Jóvenes (4 niveles)
  // ========================================

  const nivelesJovenes = await Promise.all([
    prisma.level.create({
      data: {
        order: 1,
        name: "Primer Nivel",
        description: "Nivel inicial del plan de jóvenes",
        studyPlanId: planJovenes.id,
      },
    }),
    prisma.level.create({
      data: {
        order: 2,
        name: "Segundo Nivel",
        description: "Segundo nivel del plan de jóvenes",
        studyPlanId: planJovenes.id,
      },
    }),
    prisma.level.create({
      data: {
        order: 3,
        name: "Tercer Nivel",
        description: "Tercer nivel del plan de jóvenes",
        studyPlanId: planJovenes.id,
      },
    }),
    prisma.level.create({
      data: {
        order: 4,
        name: "Cuarto Nivel",
        description: "Nivel final del plan de jóvenes",
        studyPlanId: planJovenes.id,
      },
    }),
  ]);

  // ========================================
  // NIVELES - Plan Adultos (3 niveles)
  // ========================================

  const nivelesAdultos = await Promise.all([
    prisma.level.create({
      data: {
        order: 1,
        name: "Primer Nivel",
        description: "Nivel inicial del plan de adultos",
        studyPlanId: planAdultos.id,
      },
    }),
    prisma.level.create({
      data: {
        order: 2,
        name: "Segundo Nivel",
        description: "Segundo nivel del plan de adultos",
        studyPlanId: planAdultos.id,
      },
    }),
    prisma.level.create({
      data: {
        order: 3,
        name: "Tercer Nivel",
        description: "Nivel final del plan de adultos",
        studyPlanId: planAdultos.id,
      },
    }),
  ]);

  console.log("✅ Niveles creados");

  // ========================================
  // MATERIAS - Plan Jóvenes
  // ========================================

  // Materias para Primer Nivel - Jóvenes
  const materiasJovenesN1 = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Matemática",
        code: "MAT-PJ4-1",
        description: "Matemática básica - Primer nivel",
        levelId: nivelesJovenes[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Lengua y Literatura",
        code: "LEN-PJ4-1",
        description: "Lengua y literatura - Primer nivel",
        levelId: nivelesJovenes[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Historia",
        code: "HIS-PJ4-1",
        description: "Historia argentina y mundial - Primer nivel",
        levelId: nivelesJovenes[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Geografía",
        code: "GEO-PJ4-1",
        description: "Geografía - Primer nivel",
        levelId: nivelesJovenes[0].id,
      },
    }),
  ]);

  // Materias para Segundo Nivel - Jóvenes
  const materiasJovenesN2 = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Matemática",
        code: "MAT-PJ4-2",
        description: "Matemática intermedia - Segundo nivel",
        levelId: nivelesJovenes[1].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Lengua y Literatura",
        code: "LEN-PJ4-2",
        description: "Lengua y literatura - Segundo nivel",
        levelId: nivelesJovenes[1].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Física",
        code: "FIS-PJ4-2",
        description: "Introducción a la física - Segundo nivel",
        levelId: nivelesJovenes[1].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Química",
        code: "QUI-PJ4-2",
        description: "Introducción a la química - Segundo nivel",
        levelId: nivelesJovenes[1].id,
      },
    }),
  ]);

  // ========================================
  // MATERIAS - Plan Adultos
  // ========================================

  // Materias para Primer Nivel - Adultos
  const materiasAdultosN1 = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Matemática Aplicada",
        code: "MAT-PA3-1",
        description: "Matemática con enfoque práctico - Primer nivel",
        levelId: nivelesAdultos[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Comunicación",
        code: "COM-PA3-1",
        description: "Comunicación oral y escrita - Primer nivel",
        levelId: nivelesAdultos[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Ciencias Sociales",
        code: "CSS-PA3-1",
        description: "Integración de historia y geografía - Primer nivel",
        levelId: nivelesAdultos[0].id,
      },
    }),
  ]);

  // Materias para Segundo Nivel - Adultos
  const materiasAdultosN2 = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Matemática Aplicada",
        code: "MAT-PA3-2",
        description: "Matemática intermedia - Segundo nivel",
        levelId: nivelesAdultos[1].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Comunicación",
        code: "COM-PA3-2",
        description: "Comunicación avanzada - Segundo nivel",
        levelId: nivelesAdultos[1].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: "Ciencias Naturales",
        code: "CNT-PA3-2",
        description: "Integración de física y química - Segundo nivel",
        levelId: nivelesAdultos[1].id,
      },
    }),
  ]);

  console.log("✅ Materias creadas");

  // ========================================
  // CURSOS - Plan Jóvenes
  // ========================================

  const cursosJovenes = await Promise.all([
    // Primer Nivel
    prisma.course.create({
      data: {
        name: "1°A",
        academicYear: "2025",
        capacity: 30,
        classroom: "Aula 101",
        shift: "Mañana",
        levelId: nivelesJovenes[0].id,
      },
    }),
    prisma.course.create({
      data: {
        name: "1°B",
        academicYear: "2025",
        capacity: 30,
        classroom: "Aula 102",
        shift: "Tarde",
        levelId: nivelesJovenes[0].id,
      },
    }),
    // Segundo Nivel
    prisma.course.create({
      data: {
        name: "2°A",
        academicYear: "2025",
        capacity: 28,
        classroom: "Aula 201",
        shift: "Mañana",
        levelId: nivelesJovenes[1].id,
      },
    }),
  ]);

  // ========================================
  // CURSOS - Plan Adultos
  // ========================================

  const cursosAdultos = await Promise.all([
    // Primer Nivel
    prisma.course.create({
      data: {
        name: "1°A",
        academicYear: "2025",
        capacity: 25,
        classroom: "Aula 301",
        shift: "Noche",
        levelId: nivelesAdultos[0].id,
      },
    }),
    // Segundo Nivel
    prisma.course.create({
      data: {
        name: "2°A",
        academicYear: "2025",
        capacity: 25,
        classroom: "Aula 302",
        shift: "Noche",
        levelId: nivelesAdultos[1].id,
      },
    }),
  ]);

  console.log("✅ Cursos creados");

  // ========================================
  // USUARIOS DE EJEMPLO
  // ========================================

  // Admin
  const admin = await prisma.user.create({
    data: {
      dni: "12345678",
      email: "admin@escuela.edu.ar",
      password: "$2a$10$example.hashed.password", // Reemplazar con hash real
      name: "Administrador",
      role: "ADMIN",
      isVerified: true,
      firstLogin: false,
    },
  });

  // Profesores
  const profesor1 = await prisma.user.create({
    data: {
      dni: "23456789",
      email: "profesor.matematica@escuela.edu.ar",
      password: "$2a$10$example.hashed.password",
      name: "María García",
      role: "TEACHER",
      isVerified: true,
      firstLogin: false,
      teacherProfile: {
        create: {
          specialization: "Matemática",
          hireDate: new Date("2020-03-01"),
        },
      },
    },
  });

  const profesor2 = await prisma.user.create({
    data: {
      dni: "34567890",
      email: "profesor.lengua@escuela.edu.ar",
      password: "$2a$10$example.hashed.password",
      name: "Carlos López",
      role: "TEACHER",
      isVerified: true,
      firstLogin: false,
      teacherProfile: {
        create: {
          specialization: "Lengua y Literatura",
          hireDate: new Date("2018-03-01"),
        },
      },
    },
  });

  // Estudiantes
  const estudiante1 = await prisma.user.create({
    data: {
      dni: "45678901",
      email: "estudiante1@escuela.edu.ar",
      password: "$2a$10$example.hashed.password",
      name: "Juan Pérez",
      role: "STUDENT",
      isVerified: true,
      firstLogin: false,
      studentProfile: {
        create: {
          birthDate: new Date("2008-05-15"),
          address: "Av. Corrientes 1234",
          phone: "1122334455",
          guardianName: "Roberto Pérez",
          guardianPhone: "1133445566",
        },
      },
    },
  });

  const estudiante2 = await prisma.user.create({
    data: {
      dni: "56789012",
      email: "estudiante2@escuela.edu.ar",
      password: "$2a$10$example.hashed.password",
      name: "Ana Martínez",
      role: "STUDENT",
      isVerified: true,
      firstLogin: false,
      studentProfile: {
        create: {
          birthDate: new Date("1990-08-20"),
          address: "Av. Rivadavia 5678",
          phone: "1144556677",
        },
      },
    },
  });

  console.log("✅ Usuarios creados");

  // ========================================
  // ASIGNACIONES CURSO-MATERIA-PROFESOR
  // ========================================

  // Asignar profesores a materias en cursos
  await prisma.courseSubject.create({
    data: {
      courseId: cursosJovenes[0].id,
      subjectId: materiasJovenesN1[0].id, // Matemática
      teacherId: profesor1.id,
      schedule: "Lunes y Miércoles 8:00-10:00",
    },
  });

  await prisma.courseSubject.create({
    data: {
      courseId: cursosJovenes[0].id,
      subjectId: materiasJovenesN1[1].id, // Lengua
      teacherId: profesor2.id,
      schedule: "Martes y Jueves 8:00-10:00",
    },
  });

  await prisma.courseSubject.create({
    data: {
      courseId: cursosAdultos[0].id,
      subjectId: materiasAdultosN1[0].id, // Matemática Aplicada
      teacherId: profesor1.id,
      schedule: "Lunes y Miércoles 19:00-21:00",
    },
  });

  await prisma.courseSubject.create({
    data: {
      courseId: cursosAdultos[0].id,
      subjectId: materiasAdultosN1[1].id, // Comunicación
      teacherId: profesor2.id,
      schedule: "Martes y Jueves 19:00-21:00",
    },
  });

  console.log("✅ Asignaciones curso-materia-profesor creadas");

  // ========================================
  // MATRÍCULAS
  // ========================================

  await prisma.enrollment.create({
    data: {
      studentId: estudiante1.id,
      courseId: cursosJovenes[0].id,
      status: "ACTIVE",
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: estudiante2.id,
      courseId: cursosAdultos[0].id,
      status: "ACTIVE",
    },
  });

  console.log("✅ Matrículas creadas");

  console.log("");
  console.log("🎉 Seed completado exitosamente!");
  console.log("");
  console.log("📊 Resumen:");
  console.log(`   - Planes de estudio: 2`);
  console.log(`   - Niveles: ${nivelesJovenes.length + nivelesAdultos.length}`);
  console.log(
    `   - Materias: ${materiasJovenesN1.length + materiasJovenesN2.length + materiasAdultosN1.length + materiasAdultosN2.length}`
  );
  console.log(`   - Cursos: ${cursosJovenes.length + cursosAdultos.length}`);
  console.log(`   - Usuarios: 5 (1 admin, 2 profesores, 2 estudiantes)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
