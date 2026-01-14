import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';

export const storageService = {
  // Upload a photo for a checklist item
  async uploadChecklistPhoto(
    facilityId: string,
    checklistId: string,
    itemId: string,
    file: File
  ): Promise<string> {
    try {
      const filename = `${itemId}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `facilities/${facilityId}/checklists/${checklistId}/photos/${filename}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading checklist photo:', error);
      throw error;
    }
  },

  // Upload incident photo
  async uploadIncidentPhoto(facilityId: string, incidentId: string, file: File): Promise<string> {
    try {
      const filename = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `facilities/${facilityId}/incidents/${incidentId}/photos/${filename}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading incident photo:', error);
      throw error;
    }
  },

  // Upload inspection log photo
  async uploadInspectionPhoto(facilityId: string, logId: string, file: File): Promise<string> {
    try {
      const filename = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `facilities/${facilityId}/inspections/${logId}/photos/${filename}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading inspection photo:', error);
      throw error;
    }
  },

  // Delete a file by URL
  async deleteFile(url: string): Promise<void> {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
};
