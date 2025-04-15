
import { Heart, Calendar, MapPin, Clock } from "lucide-react";
import { Event } from "@/services/gemini";
import { addFavorite, removeFavorite, isFavorite } from "@/services/localStorage";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: Event;
  onFavoriteChange?: () => void;
}

export const EventCard = ({ event, onFavoriteChange }: EventCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite(event.id));

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(event.id);
      toast.success("Removed from favorites");
    } else {
      addFavorite(event);
      toast.success("Added to favorites");
    }
    setFavorite(!favorite);
    onFavoriteChange?.();
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative">
        <button
          onClick={toggleFavorite}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              favorite ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </button>
      </CardHeader>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2">
          {event.category}
        </Badge>
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">{event.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{event.description}</p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
