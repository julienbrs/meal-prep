import React, { useState, useEffect } from "react";

interface ImageUploadProps {
  onImageChange: (file: File | null, path: string | null) => void;
  initialImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageChange,
  initialImage,
  className = "",
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImage || null
  );

  const saveImage = async (file: File) => {
    try {
      // Create a unique filename using timestamp and original name
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
      const path = `/images/recipes/${fileName}`;

      // Create FormData
      const formData = new FormData();
      formData.append("image", file);
      formData.append("path", path);

      // Save the file to the public directory
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      return path;
    } catch (error) {
      console.error("Error saving image:", error);
      return null;
    }
  };

  const handleFileProcess = async (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Save file and get path
    const path = await saveImage(file);
    onImageChange(file, path);
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            await handleFileProcess(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileProcess(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    onImageChange(null, null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await handleFileProcess(file);
    }
  };

  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <div className="flex-shrink-0">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg shadow-md"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400 mb-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-gray-500 text-center">
              Ctrl+V to paste
            </span>
          </div>
        )}
      </div>
      <div className="flex-grow">
        <label className="block">
          <span className="sr-only">Choose photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-emerald-50 file:text-emerald-700
              hover:file:bg-emerald-100
              transition-colors duration-200
            "
          />
        </label>
        <p className="mt-2 text-sm text-gray-500">
          PNG, JPG, GIF up to 10MB. Drag & drop or Ctrl+V to paste supported.
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
