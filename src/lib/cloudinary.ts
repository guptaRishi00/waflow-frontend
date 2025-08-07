export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export const uploadToCloudinary = async (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    // For unsigned uploads, we MUST use an upload preset
    // You need to create this in your Cloudinary dashboard
    formData.append("upload_preset", "ml_default");

    console.log("Uploading to Cloudinary:", {
      cloudName: import.meta.env.VITE_CLOUD_NAME,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadPreset: "ml_default",
      hasCloudName: !!import.meta.env.VITE_CLOUD_NAME,
    });

    fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUD_NAME
      }/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => {
        console.log("Cloudinary response status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("Cloudinary response data:", data);
        if (data.error) {
          console.error("Cloudinary upload error:", data.error);

          // Provide helpful error message for upload preset issues
          if (
            data.error.message &&
            data.error.message.includes("Upload preset")
          ) {
            if (
              data.error.message.includes("whitelisted for unsigned uploads")
            ) {
              reject(
                new Error(
                  `The 'ml_default' preset is not configured for unsigned uploads. Please fix this in your Cloudinary dashboard:\n` +
                    `1. Go to Settings > Upload\n` +
                    `2. Scroll to Upload presets\n` +
                    `3. Find 'ml_default' and click on it to edit\n` +
                    `4. Change Signing Mode from 'Signed' to 'Unsigned'\n` +
                    `5. Click Save\n\n` +
                    `OR create a new preset:\n` +
                    `1. Click 'Add upload preset'\n` +
                    `2. Set name to 'waflow_uploads' and Signing Mode to 'Unsigned'\n` +
                    `3. Click Save\n` +
                    `4. Update the code to use 'waflow_uploads' instead of 'ml_default'`
                )
              );
            } else {
              reject(
                new Error(
                  `Upload preset 'ml_default' not found. Please create it in your Cloudinary dashboard:\n` +
                    `1. Go to Settings > Upload\n` +
                    `2. Scroll to Upload presets\n` +
                    `3. Click 'Add upload preset'\n` +
                    `4. Set name to 'ml_default' and Signing Mode to 'Unsigned'\n` +
                    `5. Click Save`
                )
              );
            }
          } else {
            reject(new Error(data.error.message));
          }
        } else {
          resolve({
            secure_url: data.secure_url,
            public_id: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
          });
        }
      })
      .catch((error) => {
        console.error("Cloudinary upload catch error:", error);
        reject(error);
      });
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUD_NAME
      }/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: import.meta.env.VITE_API_KEY,
          signature: "", // You might need to generate a signature for security
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};
