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
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      `${filename}.json`
    );
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8"); // ✅ Write directly to file
    console.log(`✅ Successfully saved ${filename}.json`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${filename}:`, error);
    return false;
  }
}
