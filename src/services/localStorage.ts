
import { Event } from "./gemini";

const FAVORITES_KEY = "event-finder-favorites";
const LOCATION_KEY = "event-finder-location";

export const getFavorites = (): Event[] => {
  const favoritesJson = localStorage.getItem(FAVORITES_KEY);
  return favoritesJson ? JSON.parse(favoritesJson) : [];
};

export const addFavorite = (event: Event): void => {
  const favorites = getFavorites();
  if (!favorites.find(f => f.id === event.id)) {
    favorites.push(event);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = (eventId: string): void => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(f => f.id !== eventId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
};

export const isFavorite = (eventId: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(f => f.id === eventId);
};

export const saveUserLocation = (location: { lat: number; lng: number; name: string }): void => {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
};

export const getUserLocation = (): { lat: number; lng: number; name: string } | null => {
  const locationJson = localStorage.getItem(LOCATION_KEY);
  return locationJson ? JSON.parse(locationJson) : null;
};
