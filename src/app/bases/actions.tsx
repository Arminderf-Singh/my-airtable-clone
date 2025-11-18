"use server";

import { api } from "~/trpc/server";
import { revalidatePath } from "next/cache";

export async function createBase(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    
    if (!name?.trim()) {
      return { error: "Base name is required" };
    }

    const caller = await api();
    await caller.base.create({ name: name.trim() });
    
    revalidatePath("/bases");
    return { success: true, message: "Base created successfully" };
  } catch (error) {
    console.error("Error creating base:", error);
    return { error: "Failed to create base" };
  }
}