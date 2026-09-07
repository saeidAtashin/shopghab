import { prisma, isRepairStatus, type RepairStatus } from "@/lib/db";

function generateTrackingCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createUniqueTrackingCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateTrackingCode();
    const existing = await prisma.repairOrder.findUnique({
      where: { trackingCode: code },
      select: { id: true },
    });
    if (!existing) {
      return code;
    }
  }
  throw new Error("Failed to generate tracking code");
}

export type CreateRepairOrderInput = {
  name: string;
  phone: string;
  device: string;
  issue: string;
  description: string;
  imageUrl?: string;
};

export async function createRepairOrder(input: CreateRepairOrderInput) {
  const trackingCode = await createUniqueTrackingCode();

  return prisma.repairOrder.create({
    data: {
      trackingCode,
      name: input.name,
      phone: input.phone,
      device: input.device,
      issue: input.issue,
      description: input.description,
      imageUrl: input.imageUrl ?? "",
      status: "pending",
    },
  });
}

export async function getRepairOrderByCode(trackingCode: string) {
  return prisma.repairOrder.findUnique({
    where: { trackingCode: trackingCode.toUpperCase() },
  });
}

export async function listRepairOrdersByPhone(phone: string) {
  return prisma.repairOrder.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
}

export async function listRepairOrders() {
  return prisma.repairOrder.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRepairOrderStatus(
  trackingCode: string,
  status: RepairStatus,
) {
  if (!isRepairStatus(status)) {
    throw new Error("INVALID_STATUS");
  }

  return prisma.repairOrder.update({
    where: { trackingCode: trackingCode.toUpperCase() },
    data: { status },
  });
}

export function serializeOrder(order: {
  trackingCode: string;
  name: string;
  phone: string;
  device: string;
  issue: string;
  description: string;
  imageUrl: string;
  status: string;
  createdAt: Date;
}) {
  return {
    trackingCode: order.trackingCode,
    name: order.name,
    phone: order.phone,
    device: order.device,
    issue: order.issue,
    description: order.description,
    image: order.imageUrl,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
}
