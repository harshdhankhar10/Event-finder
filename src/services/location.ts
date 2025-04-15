
import { toast } from "sonner";
import { saveUserLocation } from "./localStorage";

export const getCurrentLocation = (): Promise<{ lat: number; lng: number; name: string }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          let locationName = "Current Location";
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            
            if (response.ok) {
              const data = await response.json();
              locationName = data.address?.city || 
                             data.address?.town || 
                             data.address?.state ||
                             "Current Location";
            }
          } catch (error) {
            console.error("Error fetching location name:", error);
          }
          
          const locationData = { lat: latitude, lng: longitude, name: locationName };
          saveUserLocation(locationData);
          resolve(locationData);
        } catch (error) {
          console.error("Error processing location:", error);
          reject(error);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to retrieve your location");
        reject(error);
      }
    );
  });
};
