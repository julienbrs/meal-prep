export async function loadJsonData<T>(filename: string): Promise<T> {
  try {
    console.log("filename path:", `/api/${filename}`);
    const response = await fetch(`/api/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
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
