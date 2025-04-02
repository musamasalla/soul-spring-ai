import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { formatDuration } from "@/utils/formatTime";
import { Heart, Clock, Play } from "lucide-react";
import MeditationPlayer from "./MeditationPlayer";

export default function MeditationFavorites() {
  const { favorites, removeFavorite } = useFavorites();
  const [selectedMeditation, setSelectedMeditation] = useState<number | null>(null);

  const handleClose = () => {
    setSelectedMeditation(null);
  };

  if (favorites.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent className="pt-6 pb-4">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">No Favorites Yet</h3>
          <p className="text-muted-foreground">
            Save your favorite meditations to quickly access them later.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline">Browse Meditations</Button>
        </CardFooter>
      </Card>
    );
  }

  if (selectedMeditation !== null) {
    return (
      <div>
        <MeditationPlayer
          meditation={favorites[selectedMeditation]}
          onClose={handleClose}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Favorites</h2>
        <p className="text-muted-foreground">{favorites.length} meditations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((meditation, index) => (
          <Card key={meditation.id} className="glass-card card-hover overflow-hidden">
            <div className="relative">
              {meditation.coverImage && (
                <div className="relative aspect-[3/2] w-full">
                  <img
                    src={meditation.coverImage}
                    alt={meditation.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(meditation.id);
                  }}
                  className="bg-black/30 hover:bg-black/50 text-white"
                >
                  <Heart className="h-4 w-4 fill-white" />
                </Button>
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{meditation.title}</CardTitle>
              <CardDescription className="line-clamp-1">
                {meditation.description}
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex justify-between pt-0">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {formatDuration(meditation.duration)}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => setSelectedMeditation(index)}
                className="rounded-full"
              >
                <Play className="h-4 w-4 mr-1" />
                Play
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 