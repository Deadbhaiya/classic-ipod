"use client";

import React, { useState, useEffect, useRef } from "react";
import { Battery, ChevronRight, Play, Pause, SkipBack, SkipForward, Upload, Music, X, Check, Sticker, Trash2, Plus } from "lucide-react";

interface PlacedSticker {
  id: string;
  src: string;
  x: number;
  y: number;
}

const PRESET_STICKERS = [
  "https://em-content.zobj.net/source/apple/391/star_2b50.png",
  "https://em-content.zobj.net/source/apple/391/heart-with-arrow_1f498.png",
  "https://em-content.zobj.net/source/apple/391/fire_1f525.png",
  "https://em-content.zobj.net/source/apple/391/sparkles_2728.png",
  "https://em-content.zobj.net/source/apple/391/rainbow_1f308.png",
  "https://em-content.zobj.net/source/apple/391/musical-notes_1f3b6.png",
  "https://em-content.zobj.net/source/apple/391/headphone_1f3a7.png",
  "https://em-content.zobj.net/source/apple/391/alien_1f47d.png",
  "https://em-content.zobj.net/source/apple/391/butterfly_1f98b.png",
  "https://em-content.zobj.net/source/apple/391/cherry-blossom_1f338.png",
  "https://em-content.zobj.net/source/apple/391/crown_1f451.png",
  "https://em-content.zobj.net/source/apple/391/lightning_1f329-fe0f.png",
];

type Screen = "main" | "music" | "songs" | "nowPlaying" | "extras" | "settings" | "addMusic" | "decorate" | "clock" | "games" | "snake" | "contacts" | "addContact" | "colorPicker";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const IPOD_COLORS = [
  { id: "white", name: "White", bg: "#f0f0f0", border: "#e0e0e0" },
  { id: "black", name: "Black", bg: "#1a1a1a", border: "#000" },
  { id: "silver", name: "Silver", bg: "#c0c0c0", border: "#a0a0a0" },
  { id: "spaceGray", name: "Space Gray", bg: "#52525b", border: "#3f3f46" },
  { id: "red", name: "PRODUCT(RED)", bg: "#dc2626", border: "#b91c1c" },
];

const GAMES_MENU: MenuItem[] = [
  { id: "snake", label: "Snake", target: "snake" },
];

interface MenuItem {
  id: string;
  label: string;
  target?: Screen;
  action?: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  file_path: string;
  duration: number;
  image?: string;
}

const SONG_IMAGES = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/fe98c37b-621b-4fe0-95a9-a2377a7a6e52/download-2-1768731558268.gif?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/fe98c37b-621b-4fe0-95a9-a2377a7a6e52/download-1-1768731558242.gif?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/fe98c37b-621b-4fe0-95a9-a2377a7a6e52/download-1768731558232.gif?width=8000&height=8000&resize=contain",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/fe98c37b-621b-4fe0-95a9-a2377a7a6e52/Stunning-Pixel-Art-Created-by-Waneella-1768731558229.gif?width=8000&height=8000&resize=contain",
];

const getSongImage = (songId: string) => {
  let hash = 0;
  for (let i = 0; i < songId.length; i++) {
    hash = ((hash << 5) - hash) + songId.charCodeAt(i);
    hash |= 0;
  }
  return SONG_IMAGES[Math.abs(hash) % SONG_IMAGES.length];
};

const MAIN_MENU: MenuItem[] = [
  { id: "music", label: "Music", target: "music" },
  { id: "extras", label: "Extras", target: "extras" },
  { id: "settings", label: "Settings", target: "settings" },
  { id: "shuffle", label: "Shuffle Songs", target: "nowPlaying" },
  { id: "backlight", label: "Backlight", action: "backlight" },
];

const MUSIC_MENU: MenuItem[] = [
  { id: "songs", label: "Songs", target: "songs" },
  { id: "artists", label: "Artists" },
  { id: "albums", label: "Albums" },
];

const EXTRAS_MENU: MenuItem[] = [
  { id: "addMusic", label: "Add Music", target: "addMusic" },
  { id: "decorate", label: "Decorate", target: "decorate" },
  { id: "clock", label: "Clock", target: "clock" },
  { id: "games", label: "Games", target: "games" },
  { id: "contacts", label: "Contacts", target: "contacts" },
];

const SETTINGS_MENU: MenuItem[] = [
  { id: "about", label: "About", action: "about" },
  { id: "ipod_color", label: "iPod Color", target: "colorPicker" },
  { id: "shuffle_setting", label: "Shuffle", action: "shuffle" },
  { id: "repeat", label: "Repeat", action: "repeat" },
  { id: "eq", label: "EQ", action: "eq" },
  { id: "backlight_timer", label: "Backlight Timer" },
  { id: "contrast", label: "Contrast" },
  { id: "reset", label: "Reset All Settings", action: "reset" },
];

export default function IPodPage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<Screen[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [backlightOn, setBacklightOn] = useState(true);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [customStickers, setCustomStickers] = useState<string[]>([]);
  const [draggingSticker, setDraggingSticker] = useState<string | null>(null);
  const [selectedPlacedSticker, setSelectedPlacedSticker] = useState<string | null>(null);
  const [isDraggingPlaced, setIsDraggingPlaced] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ipodColor, setIpodColor] = useState(IPOD_COLORS[0]);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Jay Thakur", phone: "+91 8558853085", email: "jaythakurclash@gmail.com" }
  ]);
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const [snakeGame, setSnakeGame] = useState({
    snake: [{ x: 5, y: 5 }],
    food: { x: 10, y: 10 },
    direction: "right" as "up" | "down" | "left" | "right",
    gameOver: false,
    score: 0,
    running: false,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stickerInputRef = useRef<HTMLInputElement | null>(null);
  const ipodRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (listContainerRef.current) {
      const selectedElement = listContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!snakeGame.running || snakeGame.gameOver) return;

    const moveSnake = () => {
      setSnakeGame(prev => {
        const head = { ...prev.snake[0] };
        switch (prev.direction) {
          case "up": head.y--; break;
          case "down": head.y++; break;
          case "left": head.x--; break;
          case "right": head.x++; break;
        }

        if (head.x < 0 || head.x >= 16 || head.y < 0 || head.y >= 12 ||
            prev.snake.some(s => s.x === head.x && s.y === head.y)) {
          return { ...prev, gameOver: true, running: false };
        }

        const newSnake = [head, ...prev.snake];
        let newFood = prev.food;
        let newScore = prev.score;

        if (head.x === prev.food.x && head.y === prev.food.y) {
          newFood = { x: Math.floor(Math.random() * 16), y: Math.floor(Math.random() * 12) };
          newScore++;
        } else {
          newSnake.pop();
        }

        return { ...prev, snake: newSnake, food: newFood, score: newScore };
      });
    };

    const gameInterval = setInterval(moveSnake, 200);
    return () => clearInterval(gameInterval);
  }, [snakeGame.running, snakeGame.gameOver]);

  const fetchSongs = async () => {
    const res = await fetch("/api/songs");
    const data = await res.json();
    if (Array.isArray(data)) {
      setSongs(data);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(prog) ? 0 : prog);
    }
  };

  const handleSongEnd = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex < songs.length - 1) {
      playSong(songs[currentIndex + 1]);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentScreen("nowPlaying");
    setHistory(prev => [...prev, currentScreen]);
  };

  const getMenuItems = (): MenuItem[] => {
    switch (currentScreen) {
      case "main": return MAIN_MENU;
      case "music": return MUSIC_MENU;
      case "extras": return EXTRAS_MENU;
      case "settings": return SETTINGS_MENU;
      case "songs": return songs.map(s => ({ id: s.id, label: s.title }));
      case "games": return GAMES_MENU;
      case "contacts": return [{ id: "addContact", label: "+ Add Contact", target: "addContact" }, ...contacts.map(c => ({ id: c.id, label: c.name }))];
      case "colorPicker": return IPOD_COLORS.map(c => ({ id: c.id, label: c.name }));
      default: return [];
    }
  };

  const menuItems = getMenuItems();

  const handleNext = () => {
    if (currentScreen === "snake" && snakeGame.running) {
      setSnakeGame(prev => ({ ...prev, direction: prev.direction !== "up" ? "down" : prev.direction }));
      return;
    }
    if (currentScreen === "nowPlaying") {
      const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
      if (currentIndex < songs.length - 1) {
        playSong(songs[currentIndex + 1]);
      }
      return;
    }
    setSelectedIndex((prev) => (prev + 1) % menuItems.length);
  };

  const handlePrev = () => {
    if (currentScreen === "snake" && snakeGame.running) {
      setSnakeGame(prev => ({ ...prev, direction: prev.direction !== "down" ? "up" : prev.direction }));
      return;
    }
    if (currentScreen === "nowPlaying") {
      const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
      if (currentIndex > 0) {
        playSong(songs[currentIndex - 1]);
      }
      return;
    }
    setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
  };

  const handleSelect = () => {
    if (currentScreen === "songs" && songs[selectedIndex]) {
      playSong(songs[selectedIndex]);
      return;
    }
    
    if (currentScreen === "main" && MAIN_MENU[selectedIndex]?.id === "shuffle" && songs.length > 0) {
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      playSong(randomSong);
      return;
    }

    if (currentScreen === "addMusic") {
      fileInputRef.current?.click();
      return;
    }

    if (currentScreen === "snake") {
      if (snakeGame.gameOver) {
        setSnakeGame({
          snake: [{ x: 5, y: 5 }],
          food: { x: 10, y: 10 },
          direction: "right",
          gameOver: false,
          score: 0,
          running: true,
        });
      } else if (!snakeGame.running) {
        setSnakeGame(prev => ({ ...prev, running: true }));
      }
      return;
    }

    if (currentScreen === "colorPicker") {
      const color = IPOD_COLORS[selectedIndex];
      if (color) {
        setIpodColor(color);
        showTemporaryMessage(`Color: ${color.name}`);
      }
      return;
    }

    if (currentScreen === "addContact") {
      if (newContact.name) {
        const contact: Contact = {
          id: `contact-${Date.now()}`,
          name: newContact.name || "",
          phone: newContact.phone || "",
          email: newContact.email || "",
        };
        setContacts(prev => [...prev, contact]);
        setNewContact({});
        showTemporaryMessage("Contact Added!");
        handleMenu();
      }
      return;
    }

    const item = menuItems[selectedIndex] as MenuItem;
    
    if (item?.action) {
      handleAction(item.action);
      return;
    }
    
    if (item?.target) {
      setHistory((prev) => [...prev, currentScreen]);
      setCurrentScreen(item.target);
      setSelectedIndex(0);
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "shuffle":
        setShuffleEnabled(!shuffleEnabled);
        showTemporaryMessage(shuffleEnabled ? "Shuffle Off" : "Shuffle On");
        break;
      case "repeat":
        setRepeatEnabled(!repeatEnabled);
        showTemporaryMessage(repeatEnabled ? "Repeat Off" : "Repeat On");
        break;
      case "backlight":
        setBacklightOn(!backlightOn);
        break;
      case "about":
        showTemporaryMessage("iPod Classic v1.0");
        break;
      case "reset":
        setShuffleEnabled(false);
        setRepeatEnabled(false);
        setBacklightOn(true);
        showTemporaryMessage("Settings Reset");
        break;
    }
  };

  const showTemporaryMessage = (msg: string) => {
    setShowMessage(msg);
    setTimeout(() => setShowMessage(null), 1500);
  };

  const handleMenu = () => {
    if (history.length > 0) {
      const prevScreen = history[history.length - 1];
      setCurrentScreen(prevScreen);
      setHistory((prev) => prev.slice(0, -1));
      setSelectedIndex(0);
    }
  };

  const togglePlay = () => {
    if (currentScreen === "snake" && snakeGame.running) {
      setSnakeGame(prev => ({ ...prev, direction: prev.direction !== "left" ? "right" : prev.direction }));
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleMenuButton = () => {
    if (currentScreen === "snake" && snakeGame.running) {
      setSnakeGame(prev => ({ ...prev, direction: prev.direction !== "right" ? "left" : prev.direction }));
      return;
    }
    handleMenu();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    showTemporaryMessage("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
    formData.append("artist", "Unknown Artist");
    formData.append("album", "Unknown Album");

    await fetch("/api/songs", {
      method: "POST",
      body: formData,
    });

    await fetchSongs();
    setUploading(false);
    showTemporaryMessage("Song Added!");
  };

  const renderSettingValue = (item: MenuItem) => {
    if (item.id === "shuffle_setting") return shuffleEnabled ? "On" : "Off";
    if (item.id === "repeat") return repeatEnabled ? "On" : "Off";
    return null;
  };

  const handleStickerDragStart = (src: string) => {
    setDraggingSticker(src);
  };

  const handleStickerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingSticker || !ipodRef.current) return;
    
    const rect = ipodRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}`,
      src: draggingSticker,
      x: Math.max(0, Math.min(90, x - 5)),
      y: Math.max(0, Math.min(90, y - 5)),
    };
    
    setPlacedStickers(prev => [...prev, newSticker]);
    setDraggingSticker(null);
  };

  const handlePlacedStickerMouseDown = (e: React.MouseEvent, stickerId: string) => {
    e.stopPropagation();
    setSelectedPlacedSticker(stickerId);
    setIsDraggingPlaced(true);
  };

  const handlePlacedStickerDrag = (e: React.MouseEvent) => {
    if (!isDraggingPlaced || !selectedPlacedSticker || !ipodRef.current) return;
    
    const rect = ipodRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPlacedStickers(prev => prev.map(s => 
      s.id === selectedPlacedSticker 
        ? { ...s, x: Math.max(0, Math.min(90, x - 5)), y: Math.max(0, Math.min(90, y - 5)) }
        : s
    ));
  };

  const handleMouseUp = () => {
    setIsDraggingPlaced(false);
  };

  const deleteSticker = (stickerId: string) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== stickerId));
    setSelectedPlacedSticker(null);
  };

  const handleStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomStickers(prev => [...prev, result]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-zinc-200 font-sans p-4 gap-8"
      onMouseMove={handlePlacedStickerDrag}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <audio
        ref={audioRef}
        src={currentSong?.file_path}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
      />

{/* iPod Body */}
        <div 
          ref={ipodRef}
          className="relative w-[320px] h-[520px] rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.2),inset_0_-4px_10px_rgba(0,0,0,0.1)] border-b-8 flex flex-col items-center p-6 select-none transition-colors duration-300"
          style={{ backgroundColor: ipodColor.bg, borderColor: ipodColor.border }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleStickerDrop}
          onClick={() => setSelectedPlacedSticker(null)}
        >
        {/* Placed Stickers */}
        {placedStickers.map(sticker => (
          <div
            key={sticker.id}
            className={`absolute cursor-move z-20 transition-transform ${selectedPlacedSticker === sticker.id ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'hover:scale-105'}`}
            style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
            onMouseDown={(e) => handlePlacedStickerMouseDown(e, sticker.id)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlacedSticker(sticker.id);
            }}
          >
            <img src={sticker.src} alt="sticker" className="w-10 h-10 object-contain pointer-events-none" />
            {selectedPlacedSticker === sticker.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSticker(sticker.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        ))}
        
          {/* Screen Container */}
          <div className={`w-full h-[200px] rounded-lg border-[6px] border-[#1a1a1a] shadow-inner overflow-hidden flex flex-col transition-all duration-300 ${backlightOn ? "bg-[#bcd3c7]" : "bg-[#8a9e94]"}`}>
            {/* Header */}
            <div className="h-6 bg-gradient-to-b from-[#333] to-[#1a1a1a] px-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white tracking-wider">iPod</span>
              <div className="flex items-center gap-1">
                {shuffleEnabled && <span className="text-[8px] text-white">🔀</span>}
                {repeatEnabled && <span className="text-[8px] text-white">🔁</span>}
                {isPlaying && <Play className="w-2 h-2 fill-white text-white" />}
                <Battery className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative hide-scrollbar">
              {showMessage && (
                <div className="absolute inset-0 bg-[#bcd3c7] z-10 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#1a1a1a]">{showMessage}</span>
                </div>
              )}

              {currentScreen === "main" && (
                <div className="p-0">
                  {MAIN_MENU.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-3 py-1 flex items-center justify-between ${
                        selectedIndex === i ? "bg-gradient-to-b from-[#4a9eff] to-[#0055ff] text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      <ChevronRight className={`w-3 h-3 ${selectedIndex === i ? "text-white" : "text-[#555]"}`} />
                    </div>
                  ))}
                </div>
              )}

              {currentScreen === "music" && (
                <div className="p-0">
                  {MUSIC_MENU.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-3 py-1 flex items-center justify-between ${
                        selectedIndex === i ? "bg-gradient-to-b from-[#4a9eff] to-[#0055ff] text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      <ChevronRight className={`w-3 h-3 ${selectedIndex === i ? "text-white" : "text-[#555]"}`} />
                    </div>
                  ))}
                </div>
              )}

              {currentScreen === "extras" && (
                <div className="p-0">
                  {EXTRAS_MENU.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-3 py-1 flex items-center justify-between ${
                        selectedIndex === i ? "bg-gradient-to-b from-[#4a9eff] to-[#0055ff] text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      <ChevronRight className={`w-3 h-3 ${selectedIndex === i ? "text-white" : "text-[#555]"}`} />
                    </div>
                  ))}
                </div>
              )}

              {currentScreen === "settings" && (
                <div ref={listContainerRef} className="p-0 h-full">
                  {SETTINGS_MENU.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-3 py-1 flex items-center justify-between ${
                        selectedIndex === i ? "bg-gradient-to-b from-[#4a9eff] to-[#0055ff] text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      <div className="flex items-center gap-1">
                        {renderSettingValue(item) && (
                          <span className={`text-xs ${selectedIndex === i ? "text-white/80" : "text-[#555]"}`}>
                            {renderSettingValue(item)}
                          </span>
                        )}
                        <ChevronRight className={`w-3 h-3 ${selectedIndex === i ? "text-white" : "text-[#555]"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentScreen === "addMusic" && (
                <div className="p-4 flex flex-col items-center justify-center h-full text-[#1a1a1a]">
                  <Upload className="w-12 h-12 text-[#1a1a1a]/40 mb-2" />
                  <h2 className="text-sm font-black mb-1 text-center">Add Music</h2>
                  <p className="text-[10px] opacity-70 text-center">Press select to choose file</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              )}

              {currentScreen === "decorate" && (
                <div className="p-4 flex flex-col items-center justify-center h-full text-[#1a1a1a]">
                  <Sticker className="w-12 h-12 text-[#1a1a1a]/40 mb-2" />
                  <h2 className="text-sm font-black mb-1 text-center">Decorate</h2>
                  <p className="text-[10px] opacity-70 text-center">Drag stickers from panel</p>
                </div>
              )}

              {currentScreen === "songs" && (
              <div ref={listContainerRef} className="p-0 h-full">
                {songs.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[#1a1a1a] text-sm">
                    No songs yet. Upload some!
                  </div>
                ) : (
                  songs.map((song, i) => (
                    <div
                      key={song.id}
                      className={`px-3 py-1 flex items-center justify-between ${
                        selectedIndex === i ? "bg-gradient-to-b from-[#4a9eff] to-[#0055ff] text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      <div className="truncate flex-1">
                        <span className="text-sm font-bold tracking-tight block truncate">{song.title}</span>
                        <span className={`text-[10px] ${selectedIndex === i ? "text-white/70" : "text-[#555]"}`}>{song.artist}</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 ${selectedIndex === i ? "text-white" : "text-[#555]"}`} />
                    </div>
                  ))
                )}
              </div>
            )}

{currentScreen === "nowPlaying" && (
                <div className="p-3 flex flex-col items-center justify-center h-full text-[#1a1a1a]">
                  <div className="w-16 h-16 rounded shadow-inner mb-2 overflow-hidden border border-zinc-400/30">
                    <img 
                      src={currentSong ? getSongImage(currentSong.id) : SONG_IMAGES[0]} 
                      alt="Album art"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-sm font-black mb-0.5 text-center truncate w-full">{currentSong?.title || "No Song"}</h2>
                  <p className="text-[10px] opacity-70">{currentSong?.artist || "Unknown"}</p>
                  
                  <div className="w-full h-3 bg-white/50 rounded-full mt-3 border border-black/10 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-b from-[#4a9eff] to-[#0055ff] transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {currentScreen === "clock" && (
                <div className="p-4 flex flex-col items-center justify-center h-full text-[#1a1a1a]">
                  <div className="text-3xl font-black tracking-tight">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              )}

              {currentScreen === "games" && (
                <div className="p-0">
                  {GAMES_MENU.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-3 py-1 flex items-center justify-between ${
                        selectedIndex === i ? "bg-gradient-to-b from-[#4a9eff] to-[#0055ff] text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      <ChevronRight className={`w-3 h-3 ${selectedIndex === i ? "text-white" : "text-[#555]"}`} />
                    </div>
                  ))}
                </div>
              )}

              {currentScreen === "snake" && (
                <div className="h-full flex flex-col">
                  <div className="px-2 py-1 flex justify-between items-center bg-[#1a1a1a]/10">
                    <span className="text-[10px] font-bold text-[#1a1a1a]">Score: {snakeGame.score}</span>
                    {snakeGame.gameOver && <span className="text-[10px] font-bold text-red-600">GAME OVER</span>}
                  </div>
                  <div className="flex-1 relative bg-[#9bb090]">
                    {snakeGame.snake.map((segment, i) => (
                      <div
                        key={i}
                        className="absolute bg-[#1a1a1a]"
                        style={{
                          left: `${(segment.x / 16) * 100}%`,
                          top: `${(segment.y / 12) * 100}%`,
                          width: '6.25%',
                          height: '8.33%',
                        }}
                      />
                    ))}
                    <div
                      className="absolute bg-red-600 rounded-full"
                      style={{
                        left: `${(snakeGame.food.x / 16) * 100}%`,
                        top: `${(snakeGame.food.y / 12) * 100}%`,
                        width: '6.25%',
                        height: '8.33%',
                      }}
                    />
                  </div>
                  {!snakeGame.running && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#bcd3c7]/80">
                      <span className="text-sm font-bold text-[#1a1a1a]">
                        {snakeGame.gameOver ? "Press Select to Restart" : "Press Select to Start"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {currentScreen === "contacts" && (
                <div ref={listContainerRef} className="p-0 h-full">
                  {menuItems.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-3 py-1 flex items-center justify-between ${
                        selectedIndex === i ? "bg-gradient-to-b from-[#4a9eff] to-[#0055ff] text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-bold tracking-tight block">{item.label}</span>
                        {i > 0 && contacts[i - 1] && (
                          <span className={`text-[10px] ${selectedIndex === i ? "text-white/70" : "text-[#555]"}`}>{contacts[i - 1].phone}</span>
                        )}
                      </div>
                      <ChevronRight className={`w-3 h-3 ${selectedIndex === i ? "text-white" : "text-[#555]"}`} />
                    </div>
                  ))}
                </div>
              )}

              {currentScreen === "addContact" && (
                <div className="p-3 flex flex-col h-full text-[#1a1a1a]">
                  <h2 className="text-sm font-black mb-2">New Contact</h2>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newContact.name || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    className="text-xs bg-white/50 border border-[#1a1a1a]/20 rounded px-2 py-1 mb-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={newContact.phone || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    className="text-xs bg-white/50 border border-[#1a1a1a]/20 rounded px-2 py-1 mb-2 w-full"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newContact.email || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    className="text-xs bg-white/50 border border-[#1a1a1a]/20 rounded px-2 py-1 mb-2 w-full"
                  />
                  <p className="text-[10px] opacity-70 mt-auto text-center">Press Select to save</p>
                </div>
              )}

              {currentScreen === "colorPicker" && (
                <div ref={listContainerRef} className="p-0 h-full">
                  {IPOD_COLORS.map((color, i) => (
                    <div
                      key={color.id}
                      className={`px-3 py-1 flex items-center justify-between ${
                        selectedIndex === i ? "bg-gradient-to-b from-[#4a9eff] to-[#0055ff] text-white" : "text-[#1a1a1a]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-black/20" 
                          style={{ backgroundColor: color.bg }}
                        />
                        <span className="text-sm font-bold tracking-tight">{color.name}</span>
                      </div>
                      {ipodColor.id === color.id && <Check className="w-3 h-3" />}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

{/* Click Wheel */}
          <div className="mt-12 relative w-56 h-56 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1),inset_0_2px_5px_rgba(0,0,0,0.05)] flex items-center justify-center border border-zinc-200">
            {/* Menu Button */}
            <button 
              onClick={handleMenuButton}
              className="absolute top-4 font-black text-zinc-400 text-xs tracking-widest hover:text-zinc-600 active:scale-95 transition-transform"
            >
              MENU
            </button>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            className="absolute right-4 hover:bg-zinc-50 rounded-full p-2 active:scale-95 transition-transform"
          >
            <SkipForward className="w-6 h-6 fill-zinc-400 text-zinc-400" />
          </button>

          {/* Prev Button */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 hover:bg-zinc-50 rounded-full p-2 active:scale-95 transition-transform"
          >
            <SkipBack className="w-6 h-6 fill-zinc-400 text-zinc-400" />
          </button>

          {/* Play/Pause Button */}
          <button 
            onClick={togglePlay}
            className="absolute bottom-4 flex gap-0.5 hover:bg-zinc-50 rounded-full p-2 active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-zinc-400 text-zinc-400" />
            <Pause className="w-5 h-5 fill-zinc-400 text-zinc-400" />
          </button>

          {/* Center Button */}
          <button 
            onClick={handleSelect}
            className="w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1),inset_0_-2px_5px_rgba(0,0,0,0.05)] border border-zinc-300 active:scale-95 transition-transform active:bg-zinc-300"
          />
        </div>
      </div>

      {/* Side Panels */}
      <div className="flex flex-col gap-4">
        {currentScreen === "addMusic" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg w-[280px]">
            <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Music
            </h2>
            
            <label className="block">
              <div className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                <Music className="w-10 h-10 mx-auto text-zinc-400 mb-2" />
                <p className="text-sm text-zinc-600 font-medium">
                  {uploading ? "Uploading..." : "Click to upload MP3"}
                </p>
                <p className="text-xs text-zinc-400 mt-1">or drag and drop</p>
              </div>
              <input
                type="file"
                accept="audio/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <div className="mt-4 pt-4 border-t border-zinc-200">
              <p className="text-xs text-zinc-500 font-medium mb-2">Library ({songs.length} songs)</p>
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {songs.map(song => (
                  <div 
                    key={song.id} 
                    className="text-sm text-zinc-700 bg-zinc-100 rounded-lg px-3 py-2 truncate cursor-pointer hover:bg-zinc-200 transition-colors"
                    onClick={() => playSong(song)}
                  >
                    <span className="font-medium">{song.title}</span>
                    <span className="text-zinc-400 text-xs block">{song.artist}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentScreen === "decorate" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg w-[280px]">
            <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Sticker className="w-5 h-5" />
              Decorate iPod
            </h2>
            
            <p className="text-xs text-zinc-500 mb-3">Drag stickers onto your iPod</p>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {PRESET_STICKERS.map((src, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => handleStickerDragStart(src)}
                  className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center cursor-grab hover:bg-zinc-200 hover:scale-110 transition-all active:cursor-grabbing"
                >
                  <img src={src} alt={`sticker ${i + 1}`} className="w-8 h-8 object-contain pointer-events-none" />
                </div>
              ))}
            </div>

            {customStickers.length > 0 && (
              <>
                <p className="text-xs text-zinc-500 mb-2 font-medium">Your Stickers</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {customStickers.map((src, i) => (
                    <div
                      key={`custom-${i}`}
                      draggable
                      onDragStart={() => handleStickerDragStart(src)}
                      className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center cursor-grab hover:bg-zinc-200 hover:scale-110 transition-all active:cursor-grabbing"
                    >
                      <img src={src} alt={`custom sticker ${i + 1}`} className="w-8 h-8 object-contain pointer-events-none" />
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <label className="block">
              <div className="border-2 border-dashed border-zinc-300 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors">
                <Plus className="w-6 h-6 mx-auto text-zinc-400 mb-1" />
                <p className="text-xs text-zinc-600 font-medium">Upload Sticker</p>
              </div>
              <input
                ref={stickerInputRef}
                type="file"
                accept="image/*"
                onChange={handleStickerUpload}
                className="hidden"
              />
            </label>

            {placedStickers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500">{placedStickers.length} sticker{placedStickers.length !== 1 ? 's' : ''} placed</p>
                  <button
                    onClick={() => setPlacedStickers([])}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Aesthetic Footer */}
      <div className="fixed bottom-8 text-center">
        <h1 className="text-zinc-500 font-bold tracking-tighter text-xl">Classic iPod UI</h1>
        <p className="text-zinc-400 text-xs">With Music Database</p>
      </div>
    </div>
  );
}
