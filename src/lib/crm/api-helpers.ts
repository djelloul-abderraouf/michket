import { NextRequest, NextResponse } from "next/server";
import { demoUsers } from "./demo-data";
import type { CrmRole } from "./types";

export function crmResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function readJsonBody<T>(request: NextRequest): Promise<Partial<T>> {
  try {
    return (await request.json()) as Partial<T>;
  } catch {
    return {};
  }
}

export function rolesFromRequest(request: NextRequest): CrmRole[] {
  const raw = request.headers.get("x-crm-roles");
  const roles = raw
    ?.split(",")
    .map((role) => role.trim())
    .filter(Boolean) as CrmRole[] | undefined;

  return roles?.length ? roles : ["admin"];
}

export function userFromRequest(request: NextRequest) {
  const id = request.headers.get("x-crm-user-id") ?? "usr-admin";
  return demoUsers.find((user) => user.id === id) ?? demoUsers[0];
}
