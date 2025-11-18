import { auth } from "~/server/auth";

export async function getSession() {
  return await auth();
}