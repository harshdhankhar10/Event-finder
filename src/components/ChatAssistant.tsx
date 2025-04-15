
import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Save, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Event, searchEvents } from "@/services/gemini";
import { addFavorite } from "@/services/localStorage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  events?: Event[];
}

export const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome", 
      text: "👋 Hi there! I'm your event assistant. Ask me about events in any location or search for specific types of events!", 
      isBot: true 
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessageId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMessageId, text: input, isBot: false }]);
    
    setInput("");
    setLoading(true);
    
    try {
      const events = await searchEvents(input);
      
      let botResponse = "Here are some events I found:";
      if (events.length === 0) {
        botResponse = "I couldn't find any events matching your query. Try a different search term or location?";
      }
      
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          text: botResponse, 
          isBot: true,
          events: events.length > 0 ? events : undefined
        }
      ]);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          text: "Sorry, I encountered an error while searching for events. Please try again.", 
          isBot: true 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = (event: Event) => {
    addFavorite(event);
    toast.success("Event saved to favorites!");
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg">
          <Bot className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh] p-0">
        <div className="flex flex-col h-full">
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Event Assistant</h3>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-indigo-700">
                <X className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[80%] rounded-lg p-3",
                  msg.isBot 
                    ? "bg-gray-100 self-start" 
                    : "bg-indigo-600 text-white self-end"
                )}
              >
                <p>{msg.text}</p>
                
                {msg.events && msg.events.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {msg.events.map((event) => (
                      <div key={event.id} className="bg-white rounded-md p-3 shadow-sm text-gray-800">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{event.name}</h4>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleSaveEvent(event)}
                            title="Save to favorites"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{event.date} • {event.location}</p>
                        <p className="text-sm mt-1 line-clamp-2">{event.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-100 self-start rounded-lg p-3 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about events..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
