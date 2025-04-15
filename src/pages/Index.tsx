import { useState, useEffect } from "react";
import { Search, MapPin, CalendarDays, Loader2, Heart } from "lucide-react";
import { Event, searchEvents } from "@/services/gemini";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFavorites, getUserLocation } from "@/services/localStorage";
import { ChatAssistant } from "@/components/ChatAssistant";
import { getCurrentLocation } from "@/services/location";
import { toast } from "sonner";

const Index = () => {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  useEffect(() => {
    setFavorites(getFavorites());
    const savedLocation = getUserLocation();
    if (savedLocation) {
      setUserLocation(savedLocation.name);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !userLocation) {
      toast.warning("Please enter a search term or location");
      return;
    }

    setLoading(true);
    try {
      const searchTerm = query.trim() || "upcoming events";
      const results = await searchEvents(searchTerm, userLocation || undefined);
      
      if (results.length === 0) {
        toast.info("No upcoming events found matching your criteria");
      }
      
      setEvents(results);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = async () => {
    setLocationDetecting(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location.name);
      toast.success(`Location detected: ${location.name}`);
      
      if (query.trim()) {
        const results = await searchEvents(query, location.name);
        setEvents(results);
      }
    } catch (error) {
      toast.error("Failed to detect location");
      console.error("Location detection error:", error);
    } finally {
      setLocationDetecting(false);
    }
  };

  const updateFavorites = () => {
    const updatedFavorites = getFavorites();
    setFavorites(updatedFavorites);
    
    setEvents(prevEvents => 
      prevEvents.map(event => ({
        ...event,
        isFavorite: updatedFavorites.some(fav => fav.id === event.id)
      }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Event Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Discover upcoming events in your area</p>
        </header>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Location..."
                    value={userLocation || ""}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAutoDetect}
                disabled={locationDetecting}
                className="min-w-[150px]"
              >
                {locationDetecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Auto-Detect
                  </>
                )}
              </Button>
              
              <Button type="submit" disabled={loading} className="min-w-[100px]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favorites
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="mt-4 text-gray-600">Searching for upcoming events...</p>
                </div>
              </div>
            ) : (
              <>
                {events.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onFavoriteChange={updateFavorites}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <CalendarDays className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No upcoming events found</h3>
                    <p className="mt-2 text-gray-500">
                      Try different search terms or locations
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-0">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onFavoriteChange={updateFavorites}
                    isFavorite={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Heart className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No favorite events yet</h3>
                <p className="mt-2 text-gray-500">
                  Click the heart icon on events to save them
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ChatAssistant />
      </div>
    </div>
  );
};

export default Index;