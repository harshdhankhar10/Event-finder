import { toast } from "sonner";

const GEMINI_API_KEY = `${import.meta.env.VITE_API_KEY}`;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string; 
  time: string; 
  location: string;
  category: string;
  imageUrl: string;
}

export const searchEvents = async (query: string, location?: string): Promise<Event[]> => {
  try {
    const locationStr = location ? ` in ${location}` : "";
    const currentDate = new Date().toISOString().split('T')[0]; 
    
    const prompt = `Retrieve ONLY upcoming events (strictly after ${currentDate}) matching: "${query}${locationStr}". 
    Return a JSON array with max 6 events having these EXACT fields:
    - id: unique string
    - name: string
    - description: string (50-100 chars)
    - date: "YYYY-MM-DD" (MUST be after ${currentDate})
    - time: "HH:MM" (24-hour format)
    - location: string
    - category: string
    - imageUrl: valid image URL
    
    Rules:
    1. ALL events MUST be in the future (date > ${currentDate})
    2. No past events allowed
    3. If no future events, return empty array []
    4. Only real, verified events
    5. Strictly valid JSON format`;

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();
    const eventsText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!eventsText || !eventsText.includes("[")) {
      return [];
    }

    const events: Event[] = JSON.parse(
      eventsText.substring(
        eventsText.indexOf("["),
        eventsText.lastIndexOf("]") + 1
      )
    );

    const validEvents = events.filter(event => {
      const eventDate = new Date(`${event.date}T${event.time}`);
      return eventDate > new Date();
    });

    return validEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    toast.error("Failed to fetch events. Please try again.");
    return [];
  }
};