import { Test, TestingModule } from '@nestjs/testing';
import { LmsService } from './lms.service';
import { PrismaService } from '../../database/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DifficultyLevel, LessonContentType } from '@prisma/client';

describe('LmsService', () => {
  let service: LmsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      course: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      lesson: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      assignment: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      assignmentSubmission: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      student: {
        findUnique: jest.fn(),
      },
      program: {
        findUnique: jest.fn(),
      },
      certificate: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LmsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LmsService>(LmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCourse', () => {
    it('should create course when code is unique', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      const mockCourse = { id: 'c-1', code: 'CRS-ROS2', title: 'ROS2 Robotics' };
      prisma.course.create.mockResolvedValue(mockCourse);

      const result = await service.createCourse({
        code: 'CRS-ROS2',
        title: 'ROS2 Robotics',
        category: 'Robotics',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
      });

      expect(prisma.course.create).toHaveBeenCalled();
      expect(result).toEqual(mockCourse);
    });

    it('should throw ConflictException if code already exists', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'existing', code: 'CRS-ROS2' });

      await expect(
        service.createCourse({
          code: 'CRS-ROS2',
          title: 'ROS2 Robotics',
          category: 'Robotics',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('addLesson', () => {
    it('should add lesson when lesson number is unique for course', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c-1', title: 'Course 1' });
      prisma.lesson.findUnique.mockResolvedValue(null);
      const mockLesson = { id: 'l-1', lessonNumber: 1, title: 'Introduction' };
      prisma.lesson.create.mockResolvedValue(mockLesson);

      const result = await service.addLesson('c-1', {
        lessonNumber: 1,
        title: 'Introduction',
        contentType: LessonContentType.VIDEO,
      });

      expect(result).toEqual(mockLesson);
    });
  });

  describe('gradeSubmission', () => {
    it('should award grade and feedback within maxScore limit', async () => {
      prisma.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub-1',
        assignment: { maxScore: 100 },
      });
      prisma.assignmentSubmission.update.mockResolvedValue({
        id: 'sub-1',
        scoreAwarded: 95,
        feedback: 'Great work',
      });

      const result = await service.gradeSubmission('sub-1', {
        scoreAwarded: 95,
        feedback: 'Great work',
      });

      expect(result.scoreAwarded).toBe(95);
    });

    it('should throw BadRequestException if scoreAwarded exceeds maxScore', async () => {
      prisma.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub-1',
        assignment: { maxScore: 50 },
      });

      await expect(
        service.gradeSubmission('sub-1', {
          scoreAwarded: 75,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('issueCertificate', () => {
    it('should generate certificate with unique verification token and qrUrl', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 's-1', firstName: 'Rohan' });
      prisma.program.findUnique.mockResolvedValue({ id: 'p-1', title: 'Robotics AI' });
      prisma.certificate.findFirst.mockResolvedValue(null);
      prisma.certificate.create.mockImplementation(({ data }) => Promise.resolve({ id: 'cert-1', ...data }));

      const result = await service.issueCertificate({
        studentId: 's-1',
        programId: 'p-1',
      });

      expect(result.certificateNumber).toContain('TECHM4-');
      expect(result.verificationToken).toContain('cert_');
      expect(result.qrVerificationUrl).toContain('https://techm4india.com/verify-certificate?token=');
      expect(prisma.certificate.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if certificate was already issued', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 's-1' });
      prisma.program.findUnique.mockResolvedValue({ id: 'p-1', title: 'Robotics' });
      prisma.certificate.findFirst.mockResolvedValue({ id: 'cert-prev', certificateNumber: 'T4I-001' });

      await expect(
        service.issueCertificate({
          studentId: 's-1',
          programId: 'p-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyCertificate', () => {
    it('should return certificate validation info for valid token', async () => {
      prisma.certificate.findUnique.mockResolvedValue({
        certificateNumber: 'TECHM4-2026-CERT-A1B2',
        issueDate: new Date(),
        isRevoked: false,
        student: {
          studentId: 'STD-001',
          firstName: 'Aarav',
          lastName: 'Sharma',
          institution: { name: 'Osmania University' },
        },
        program: {
          code: 'PRG-ROB-01',
          title: 'Autonomous Robotics',
          division: 'TECHM4_ENGINEERING',
          credits: 4,
          certificationType: 'TECHM4_INDUSTRY_CERTIFICATE',
        },
      });

      const result = await service.verifyCertificate('valid-token');
      expect(result.isValid).toBe(true);
      expect(result.issuedTo).toBe('Aarav Sharma');
      expect(result.institution).toBe('Osmania University');
    });

    it('should throw NotFoundException for unknown token', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);

      await expect(service.verifyCertificate('bad-token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
