import { prisma, isOrderStatus, type OrderStatus } from "@/lib/db";

function generateTrackingCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createUniqueTrackingCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateTrackingCode();
    const existing = await prisma.caseOrder.findUnique({
      where: { trackingCode: code },
      select: { id: true },
    });
    if (!existing) {
      return code;
    }
  }
  throw new Error("Failed to generate tracking code");
}

export type DesignType = "predesigned" | "custom";

export type CreateCaseOrderInput = {
  name: string;
  phone: string;
  phoneModel: string;
  designType: DesignType;
  caseSlug?: string;
  caseTitle?: string;
  description: string;
  imageUrl?: string;
};

export async function createCaseOrder(input: CreateCaseOrderInput) {
  const trackingCode = await createUniqueTrackingCode();

  return prisma.caseOrder.create({
    data: {
      trackingCode,
      name: input.name,
      phone: input.phone,
      phoneModel: input.phoneModel,
      designType: input.designType,
      caseSlug: input.caseSlug ?? "",
      caseTitle: input.caseTitle ?? "",
      description: input.description,
      imageUrl: input.imageUrl ?? "",
      status: "pending",
    },
  });
}

export async function getCaseOrderByCode(trackingCode: string) {
  return prisma.caseOrder.findUnique({
    where: { trackingCode: trackingCode.toUpperCase() },
  });
}

export async function listCaseOrdersByPhone(phone: string) {
  return prisma.caseOrder.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
}

export async function listCaseOrders() {
  return prisma.caseOrder.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateCaseOrderStatus(
  trackingCode: string,
  status: OrderStatus,
) {
  if (!isOrderStatus(status)) {
    throw new Error("INVALID_STATUS");
  }

  return prisma.caseOrder.update({
    where: { trackingCode: trackingCode.toUpperCase() },
    data: { status },
  });
}

export function serializeOrder(order: {
  trackingCode: string;
  name: string;
  phone: string;
  phoneModel: string;
  designType: string;
  caseSlug: string;
  caseTitle: string;
  description: string;
  imageUrl: string;
  status: string;
  createdAt: Date;
}) {
  return {
    trackingCode: order.trackingCode,
    name: order.name,
    phone: order.phone,
    phoneModel: order.phoneModel,
    designType: order.designType,
    caseSlug: order.caseSlug,
    caseTitle: order.caseTitle,
    description: order.description,
    image: order.imageUrl,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    // Back-compat aliases for older UI fields
    device: order.phoneModel,
    issue:
      order.designType === "custom"
        ? "طراحی سفارشی"
        : order.caseTitle || "قاب آماده",
  };
}

/** @deprecated Use createCaseOrder */
export const createRepairOrder = createCaseOrder;
/** @deprecated Use getCaseOrderByCode */
export const getRepairOrderByCode = getCaseOrderByCode;
/** @deprecated Use listCaseOrdersByPhone */
export const listRepairOrdersByPhone = listCaseOrdersByPhone;
/** @deprecated Use listCaseOrders */
export const listRepairOrders = listCaseOrders;
/** @deprecated Use updateCaseOrderStatus */
export const updateRepairOrderStatus = updateCaseOrderStatus;
