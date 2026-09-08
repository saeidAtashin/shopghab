import { apiRequest } from "@/lib/api-client";
import { consoleCatalog, type ConsoleId } from "@/lib/console-catalog";
import {
  formatInstallGameListDescription,
  type InstallListGame,
} from "@/lib/game-install-list";
import type { InstallMethodId } from "@/lib/game-install-quote";

export type RepairDevice = { id: number; name: string };
export type RepairProblemType = { id: number; name: string };

export type RepairRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "WAITING_FOR_PART"
  | "DONE"
  | "DELIVERED"
  | "CANCELED";

export type RepairRequestPayload = {
  name: string;
  phone_number: string;
  problem_type: number;
  device_type: number;
  description: string;
};

export type RepairFormValues = {
  name?: string;
  phone: string;
  description?: string;
};

const API_PLACEHOLDER = " ";

export function buildRepairRequestPayload(
  form: RepairFormValues,
  deviceTypeId: number | "",
  problemTypeId: number | "",
  devices: RepairDevice[],
  problemTypes: RepairProblemType[],
): RepairRequestPayload {
  const device_type =
    deviceTypeId !== "" ? deviceTypeId : (devices[0]?.id ?? 1);
  const problem_type =
    problemTypeId !== "" ? problemTypeId : (problemTypes[0]?.id ?? 1);

  return {
    name: form.name?.trim() ? form.name.trim() : API_PLACEHOLDER,
    phone_number: form.phone,
    device_type,
    problem_type,
    description: form.description?.trim()
      ? form.description.trim()
      : API_PLACEHOLDER,
  };
}

export type RepairRequestItem = {
  id?: number;
  name: string;
  phone_number: string;
  problem_type: number;
  device_type: number;
  description: string;
  image?: string | null;
  status: RepairRequestStatus;
  estimated_price?: number | null;
  final_price?: number | null;
  admin_note?: string | null;
  created_at?: string;
};

type ApiWrapper<T> = {
  message?: string;
  data?: T;
};

type PaginatedResults<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
};

function unwrapData<T>(payload: ApiWrapper<T>): T {
  if (!payload.data) {
    throw new Error("Invalid API response");
  }
  return payload.data;
}

function unwrapResults<T>(payload: ApiWrapper<PaginatedResults<T>>): T[] {
  const data = unwrapData(payload);
  return data.results ?? [];
}

export async function fetchRepairDevices(): Promise<RepairDevice[]> {
  const response = await apiRequest<ApiWrapper<PaginatedResults<RepairDevice>>>(
    "/repair/devices/",
    { auth: false },
  );
  return unwrapResults(response);
}

export async function fetchRepairProblemTypes(
  deviceId: number,
): Promise<RepairProblemType[]> {
  const response = await apiRequest<
    ApiWrapper<PaginatedResults<RepairProblemType>>
  >(`/repair/problem-types/?devices=${deviceId}`, { auth: false });
  return unwrapResults(response);
}

export async function submitRepairRequest(
  payload: RepairRequestPayload,
): Promise<RepairRequestItem> {
  const response = await apiRequest<ApiWrapper<RepairRequestItem>>(
    "/repair/requests/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return unwrapData(response);
}

export async function fetchRepairRequests(
  page = 1,
): Promise<RepairRequestItem[]> {
  const response = await apiRequest<
    ApiWrapper<PaginatedResults<RepairRequestItem>>
  >(`/repair/requests/?page=${page}&page_size=100`);
  return unwrapResults(response);
}

export function matchProblemTypeForGameInstall(
  types: RepairProblemType[],
): RepairProblemType | undefined {
  return types.find((type) => /نصب/i.test(type.name)) ?? types[0];
}

export async function submitGameInstallRequest(params: {
  consoleId: ConsoleId;
  phone: string;
  name?: string;
  games: InstallListGame[];
  consoleLabel: string;
  installMethodId: InstallMethodId;
}): Promise<RepairRequestItem> {
  const devices = await fetchRepairDevices();
  const device = matchDeviceForConsole(devices, params.consoleId);

  if (!device) {
    throw new Error("دستگاه مورد نظر یافت نشد.");
  }

  const problemTypes = await fetchRepairProblemTypes(device.id);
  const problemType = matchProblemTypeForGameInstall(problemTypes);

  if (!problemType) {
    throw new Error("نوع مشکل برای ثبت درخواست یافت نشد.");
  }

  const payload: RepairRequestPayload = {
    name: params.name?.trim() ? params.name.trim() : API_PLACEHOLDER,
    phone_number: params.phone,
    device_type: device.id,
    problem_type: problemType.id,
    description: formatInstallGameListDescription(
      params.games,
      params.consoleLabel,
      { installMethodId: params.installMethodId },
    ),
  };

  return submitRepairRequest(payload);
}

export function matchDeviceForConsole(
  devices: RepairDevice[],
  consoleId: ConsoleId,
): RepairDevice | undefined {
  if (consoleId === "xbox") {
    return devices.find((device) =>
      device.name.toLowerCase().includes("xbox"),
    );
  }

  const title = consoleCatalog[consoleId].title.toLowerCase();
  const id = consoleId.toLowerCase();

  return devices.find(
    (device) => {
      const name = device.name.toLowerCase();
      return name.includes(title) || name.includes(id);
    },
  );
}

export function buildDeviceNameMap(
  devices: RepairDevice[],
): Map<number, string> {
  return new Map(devices.map((device) => [device.id, device.name]));
}

export async function fetchProblemTypeNameMap(
  deviceIds: number[],
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const uniqueIds = [...new Set(deviceIds)];

  await Promise.all(
    uniqueIds.map(async (deviceId) => {
      const types = await fetchRepairProblemTypes(deviceId);
      for (const type of types) {
        map.set(type.id, type.name);
      }
    }),
  );

  return map;
}

export function mapRepairRequestToAdminOrder(
  item: RepairRequestItem,
  index: number,
  deviceNames: Map<number, string>,
  problemNames: Map<number, string>,
) {
  return {
    trackingCode:
      item.id != null ? String(item.id) : `${item.phone_number}-${index}`,
    name: item.name,
    phone: item.phone_number,
    device: deviceNames.get(item.device_type) ?? String(item.device_type),
    issue: problemNames.get(item.problem_type) ?? String(item.problem_type),
    status: item.status,
    createdAt: item.created_at ?? "",
  };
}
