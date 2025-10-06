/**
 * Resizes a base64 encoded image to fit within the specified dimensions while maintaining aspect ratio.
 * This is critical for reducing memory usage and payload size before sending images to an API.
 * @param base64Str The base64 string of the image (without the data:image/jpeg;base64, prefix).
 * @param maxWidth The maximum width of the resized image.
 * @param maxHeight The maximum height of the resized image.
 * @returns A Promise that resolves with the new, resized base64 string.
 */
export const resizeImage = (base64Str: string, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Str}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get the data URL with JPEG format and a quality setting to further reduce size
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Return only the base64 part, removing the "data:image/jpeg;base64," prefix
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = (error) => {
      console.error("Error loading image for resizing:", error);
      reject(new Error('Could not load image for resizing.'));
    };
  });
};
