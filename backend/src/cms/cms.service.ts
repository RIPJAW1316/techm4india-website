import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CmsContentStatus, Prisma } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import { AddCmsRevisionDto, CmsPageQueryDto, CreateCmsPageDto } from "./dto/cms.dto";

@Injectable()
export class CmsService extends V2ServiceBase {
  private canManage(principal: Principal): boolean {
    return principal.permissions.includes("cms.content.manage");
  }

  private visibility(principal: Principal): Prisma.CmsPageWhereInput {
    return this.canManage(principal) ? {} : { status: CmsContentStatus.PUBLISHED };
  }

  private async page_(principal: Principal, id: string) {
    const row = await this.prisma.cmsPage.findFirst({
      where: {
        id,
        organizationId: this.organizationId(principal),
        ...this.visibility(principal),
      },
      include: { _count: { select: { revisions: true } } },
    });
    if (!row) throw new NotFoundException("Content page not found");
    return row;
  }

  async listPages(principal: Principal, query: CmsPageQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.CmsPageWhereInput = {
      organizationId,
      ...this.visibility(principal),
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(search
        ? {
            OR: [
              { slug: { contains: search, mode: "insensitive" } },
              { title: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.cmsPage.findMany({
        where,
        include: { _count: { select: { revisions: true } } },
        orderBy: [{ updatedAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.cmsPage.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  getPage(principal: Principal, id: string) {
    return this.prisma.cmsPage
      .findFirst({
        where: {
          id,
          organizationId: this.organizationId(principal),
          ...this.visibility(principal),
        },
        include: {
          revisions: { orderBy: { version: "desc" } },
          _count: { select: { revisions: true } },
        },
      })
      .then((row) => {
        if (!row) throw new NotFoundException("Content page not found");
        return row;
      });
  }

  async createPage(principal: Principal, dto: CreateCmsPageDto, request?: RequestMetadata) {
    const organizationId = this.organizationId(principal);
    let row;
    try {
      row = await this.prisma.cmsPage.create({
        data: {
          organizationId,
          slug: dto.slug.trim().toLowerCase(),
          title: dto.title.trim(),
          type: dto.type,
          createdByUserId: principal.userId,
          revisions: {
            create: {
              version: 1,
              title: dto.title.trim(),
              summary: dto.summary?.trim(),
              body: dto.body.trim(),
              authorUserId: principal.userId,
            },
          },
        },
        include: { _count: { select: { revisions: true } } },
      });
    } catch (error) {
      this.duplicate(error, "A content page with this slug already exists");
    }
    await this.record("CMS_PAGE_CREATED", principal, "CmsPage", row.id, request, {
      slug: row.slug,
    });
    return row;
  }

  async addRevision(
    principal: Principal,
    id: string,
    dto: AddCmsRevisionDto,
    request?: RequestMetadata,
  ) {
    const current = await this.page_(principal, id);
    if (
      current.status !== CmsContentStatus.DRAFT &&
      current.status !== CmsContentStatus.IN_REVIEW
    ) {
      throw new ConflictException("Revisions can only be added while drafting or in review");
    }
    const latest = await this.prisma.cmsRevision.findFirst({
      where: { pageId: id },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const revision = await this.prisma.cmsRevision.create({
      data: {
        pageId: id,
        version: (latest?.version ?? 0) + 1,
        title: dto.title.trim(),
        summary: dto.summary?.trim(),
        body: dto.body.trim(),
        authorUserId: principal.userId,
      },
    });
    await this.prisma.cmsPage.update({
      where: { id },
      data: { title: dto.title.trim() },
    });
    await this.record("CMS_REVISION_ADDED", principal, "CmsPage", id, request, {
      version: revision.version,
    });
    return revision;
  }

  async transition(
    principal: Principal,
    id: string,
    action: "submit" | "publish" | "archive",
    request?: RequestMetadata,
  ) {
    const current = await this.page_(principal, id);
    if (action === "submit" && current.status !== CmsContentStatus.DRAFT) {
      throw new ConflictException("Only draft pages can be submitted for review");
    }
    if (action === "publish" && current.status !== CmsContentStatus.IN_REVIEW) {
      throw new ConflictException("Only pages in review can be published");
    }
    if (action === "archive" && current.status !== CmsContentStatus.PUBLISHED) {
      throw new ConflictException("Only published pages can be archived");
    }
    const now = new Date();
    let publishedRevisionId = current.publishedRevisionId;
    if (action === "publish") {
      const latest = await this.prisma.cmsRevision.findFirstOrThrow({
        where: { pageId: id },
        orderBy: { version: "desc" },
        select: { id: true },
      });
      publishedRevisionId = latest.id;
    }
    const row = await this.prisma.cmsPage.update({
      where: { id },
      data: {
        status:
          action === "submit"
            ? CmsContentStatus.IN_REVIEW
            : action === "publish"
              ? CmsContentStatus.PUBLISHED
              : CmsContentStatus.ARCHIVED,
        ...(action === "publish" ? { publishedRevisionId, publishedAt: now } : {}),
        ...(action === "archive" ? { archivedAt: now } : {}),
      },
      include: { _count: { select: { revisions: true } } },
    });
    await this.record(`CMS_PAGE_${action.toUpperCase()}`, principal, "CmsPage", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }
}
