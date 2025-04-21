import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth } from "@/integrations/firebase/client"; // Assuming storage uses the same firebase app
import { v4 as uuidv4 } from 'uuid';
// Import the initialized storage instance directly
import { storage } from "@/integrations/firebase/firebaseConfig"; 

interface UploadResult {
    downloadURL: string;
    filePath: string;
}

/**
 * Uploads a file to Firebase Storage.
 * @param file The file object to upload.
 * @param path The desired path in Firebase Storage (e.g., 'restaurants/logos/userId').
 * @returns A promise that resolves with the download URL of the uploaded file.
 */
const uploadImage = async (file: File, path: string): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  // Optional: Add checks for file type and size here
  // if (!file.type.startsWith('image/')) { ... }
  // if (file.size > MAX_SIZE) { ... }

  console.log(`Uploading image to: ${path}`);
  const storageRef = ref(storage, path);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Uploaded a blob or file!', snapshot);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File available at', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Deletes a file from Firebase Storage.
 * @param path The full path to the file in Firebase Storage.
 */
const deleteImage = async (path: string): Promise<void> => {
    if (!path) {
        console.warn("No path provided for deletion.");
        return;
    }
    console.log(`Deleting image from: ${path}`);
    const storageRef = ref(storage, path);
    try {
        await deleteObject(storageRef);
        console.log("Image deleted successfully");
    } catch (error: any) {
        // Ignore "object-not-found" errors, as the file might already be deleted
        if (error.code === 'storage/object-not-found') { 
            console.warn(`Image not found at path (may already be deleted): ${path}`);
        } else {
             console.error("Error deleting image:", error);
             throw new Error(`Failed to delete image: ${error.message || 'Unknown error'}`);
        }
    }
};

const storageService = {
    /**
     * Uploads a file to Firebase Storage.
     * @param file The file to upload.
     * @param pathPrefix The desired path prefix in the storage bucket (e.g., 'menu_items', 'restaurant_logos').
     * @param existingFileName Optional. If provided, attempts to use this name without the extension. Otherwise, generates a UUID.
     * @returns Promise resolving with the download URL and the full file path.
     */
    uploadFile: async (file: File, pathPrefix: string, existingFileName?: string): Promise<UploadResult> => {
        if (!file) {
            throw new Error("No file provided for upload.");
        }

        // Generate a unique filename using UUID or use the existing one
        const fileExtension = file.name.split('.').pop();
        if (!fileExtension) {
            throw new Error("Could not determine file extension.");
        }
        const fileNameBase = existingFileName ? existingFileName : uuidv4();
        const fileName = `${fileNameBase}.${fileExtension}`;
        const filePath = `${pathPrefix}/${fileName}`;
        const storageRef = ref(storage, filePath);

        try {
            console.log(`Uploading file to: ${filePath}`);
            const snapshot = await uploadBytes(storageRef, file);
            console.log('File uploaded successfully!', snapshot);

            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at', downloadURL);

            return { downloadURL, filePath };
        } catch (error) {
            console.error("Error uploading file:", error);
            // Consider more specific error handling or re-throwing
            if (error instanceof Error) {
                throw new Error(`Failed to upload file: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred during file upload.");
            }
        }
    },

    uploadImage,
    deleteImage
};

export default storageService; 