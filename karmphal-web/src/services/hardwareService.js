import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

class HardwareService {
  /**
   * Request camera permission and take a photo securely.
   */
  async scanKundaliPhoto() {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Camera is only supported on mobile devices.');
    }

    try {
      // 1. Check permissions first (Privacy by design)
      const permissions = await Camera.checkPermissions();
      
      if (permissions.camera !== 'granted') {
        const req = await Camera.requestPermissions();
        if (req.camera !== 'granted') {
          throw new Error('Camera permission denied by user.');
        }
      }

      // 2. Capture the image
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      // 3. Securely read the file from the app's cache directory (not public gallery)
      const base64Data = await this.readAsBase64(photo);

      // Return the base64 data to be sent to Gemini AI for processing
      return {
        success: true,
        format: photo.format,
        base64: base64Data
      };
    } catch (error) {
      console.error('Camera/Hardware Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async readAsBase64(photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    
    return await this.convertBlobToBase64(blob);
  }

  convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Save a base64 encoded PDF file to the device's Documents directory
   * using Capacitor Filesystem.
   */
  async saveBase64ToDownloads(base64Data, filename) {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Not running natively');
    }

    try {
      // Remove data url prefix if present
      const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

      const result = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Documents,
        recursive: true
      });

      return {
        success: true,
        uri: result.uri
      };
    } catch (e) {
      console.error('Filesystem write error:', e);
      return {
        success: false,
        error: e.message
      };
    }
  }
}

export const hardwareService = new HardwareService();
