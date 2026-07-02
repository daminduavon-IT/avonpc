import axios from 'axios';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Client-side guards. NOTE: these improve UX but are NOT security — a
// determined user can bypass them. The unsigned upload preset MUST also be
// restricted in the Cloudinary dashboard (allowed formats, max file size,
// fixed folder, moderation). See DEPLOY_CHECKLIST.md.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary credentials are not configured in environment variables.");
    }

    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("File is too large. Please upload a file under 10 MB.");
    }
    if (file.type && !ALLOWED_UPLOAD_TYPES.includes(file.type)) {
        throw new Error("Unsupported file type. Please upload an image or PDF.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};
