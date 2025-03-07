"use server";

import fs from "fs";
import path from "path";

export async function loadJsonData<T>(filename: string): Promise<T> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      `${filename}.json`
    );
    const fileContents = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContents) as T;
  } catch (error) {
    console.error(`Error loading JSON file: ${filename}`, error);
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

    if (!response.ok) {
      throw new Error(`Failed to save ${filename}: ${response.status}`);
    }
    console.log("response:", response);

    return true;
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
    return false;
  }
}
