"use server";

import fs from "fs";
import path from "path";

export async function loadJsonData<T>(filename: string): Promise<T> {
  try {
    // Try to get data from an API route
    const response = await fetch(`/api/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename} data`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error loading JSON file: ${filename}`, error);
    // Return a default empty value based on the filename
    if (filename === "foodItems") return [] as unknown as T;
    if (filename === "meals") return [] as unknown as T;
    if (filename === "mealPlans") return { default: {} } as unknown as T;
    throw error;
  }
}

export async function saveJsonData<T>(
  filename: string,
  data: T
): Promise<boolean> {
  try {
    const response = await fetch(`/api/${filename}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error(`❌ Error saving ${filename}:`, error);
    return false;
  }
}
