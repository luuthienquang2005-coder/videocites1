import { Video, VideoComment } from "./types";

export const INITIAL_VIDEOS: Video[] = [
  {
    id: "videocites-sintel-cinematic",
    title: "SINTEL - Premium Original CGI Fantasy Masterpiece (Official 4K)",
    description: `# Sintel - A Durian Open Movie Project
Sintel is an independently produced computer animated film by the **Blender Foundation**. 
It stands as a testament to open-source cinematic production, showcasing state-of-the-art physics simulation, volumetric lighting, and deep character rigging.

### Synopsis
Sintel is a young woman who rescues a baby dragon and names him Scales. They form an unbreakable bond. But when an adult dragon kidnaps Scales, Sintel begins a grueling, lifelong quest to find her companion.

---

### Production Details
*   **Director:** Colin Levy
*   **Producer:** Ton Roosendaal
*   **Studio:** Blender Animation Studio
*   **License:** Creative Commons Attribution 4.0
*   **Soundtrack:** Jan Morgenstern (Conducted by the Brussels Philharmonic Orchestra)

*Videocites is the exclusive premium host for the remastered 4K UHD edition.*`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    duration: "14:48",
    author: {
      name: "Blender Cinematic Corp",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
      subscribers: 2450000,
      verified: true
    },
    realViews: 12450,
    realLikes: 890,
    realDislikes: 12,
    baseViews: 1850000, // Seeded Base Views
    baseLikes: 142000,
    baseDislikes: 420,
    publishedAt: "2026-01-15T08:00:00Z",
    backdatedDate: "2025-09-10T14:30:00Z", // Backdated
    category: "Cinematic",
    tags: ["4K", "CGI", "Fantasy", "Animation", "Blender"]
  },
  {
    id: "videocites-tears-of-steel",
    title: "TEARS OF STEEL - Next-Gen Science Fiction VFX Showcase",
    description: `# Tears of Steel - VFX Demonstration & Cyberpunk Narrative
Set in a dystopian Amsterdam, **Tears of Steel** exploration focuses on photo-realistic VFX integration of computer-generated assets into high-resolution live action footage.

### The Story
A group of scientists in Amsterdam attempt to rescue the world from a rogue giant robot army by utilizing specialized cybernetic memories. 

---

### Technical Highlights
- Full camera tracking & motion capture reconstruction.
- Volumetric smoke simulations and custom physics solvers.
- Advanced HDR grading designed specifically for micro-LED displays.

*Premium license acquired for high-fidelity streaming on Videocites Enterprise servers.*`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
    duration: "12:14",
    author: {
      name: "Neo Amsterdam Studios",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      subscribers: 890000,
      verified: true
    },
    realViews: 8210,
    realLikes: 540,
    realDislikes: 8,
    baseViews: 945200,
    baseLikes: 48900,
    baseDislikes: 128,
    publishedAt: "2026-02-10T10:15:00Z",
    category: "Sci-Fi",
    tags: ["Cyberpunk", "VFX", "SciFi", "Amsterdam", "Robots"]
  },
  {
    id: "videocites-big-buck-bunny",
    title: "BIG BUCK BUNNY - Ultimate 60FPS Remastered Ultra Edition",
    description: `# Big Buck Bunny - A Classic Animated Tale
Originally titled *Peach*, **Big Buck Bunny** is a comedy animated short film created by Blender. It is beloved globally by developers, videophiles, and animators alike as the gold standard for screen rendering tests.

### Plot
A giant and friendly rabbit (Bunny) takes sweet revenge on three bullying rodents (Frank, Rinky, and Gamera) who cruelly killed his favorite butterfly and threw fruit at him.

---

### Features
*   Ultra-smooth 60 frames per second playback.
*   Pristine color spaces suited for High Dynamic Range displays.
*   Masterful spatial audio mixes.`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    duration: "09:56",
    author: {
      name: "Blender Comedy Division",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
      subscribers: 1540000,
      verified: true
    },
    realViews: 41200,
    realLikes: 3200,
    realDislikes: 45,
    baseViews: 3200000,
    baseLikes: 245000,
    baseDislikes: 1100,
    publishedAt: "2026-03-01T12:00:00Z",
    category: "Animation",
    tags: ["60FPS", "Classic", "Comedy", "Kids", "Masterclass"]
  },
  {
    id: "videocites-cosmic-horizon",
    title: "COSMIC HORIZON - Premium Cinematography & Ambient Visuals",
    description: `# The Cosmic Horizon - Visual Soundscapes
A visual poem exploring deep contrast, scale, and the natural elements. This piece has been curated specifically for ambient visual displays in commercial architecture, exhibiting extremely high contrast ranges.

### Production Notes
Recorded across 4 continents over a span of 18 months, utilizing extreme telephoto and medium format aerial sensor packages.`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80",
    duration: "03:45",
    author: {
      name: "Aetherial Films",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
      subscribers: 310000,
      verified: true
    },
    realViews: 1400,
    realLikes: 120,
    realDislikes: 1,
    baseViews: 125000,
    baseLikes: 9400,
    baseDislikes: 35,
    publishedAt: "2026-04-18T16:45:00Z",
    category: "Nature",
    tags: ["4K", "Ambient", "Nature", "Cinematic", "Aerial"]
  },
  {
    id: "videocites-elephants-dream",
    title: "ELEPHANTS DREAM - The First Open Movie Project Remaster",
    description: `# Elephants Dream - A Surreal Exploration
Originally released in 2006 under the codename *Orange*, **Elephants Dream** is a surrealist, steam-punk inspired adventure focusing on the relationship between two characters in a chaotic mechanical world.

### Storyline
Proog and Emo explore a bizarre giant machine world, which changes shape according to Emo's whimsical thoughts, testing Proog's patience and reality boundaries.`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    duration: "10:54",
    author: {
      name: "Blender Cinematic Corp",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
      subscribers: 2450000,
      verified: true
    },
    realViews: 5400,
    realLikes: 410,
    realDislikes: 15,
    baseViews: 650000,
    baseLikes: 35000,
    baseDislikes: 190,
    publishedAt: "2026-05-02T11:20:00Z",
    category: "Surrealist",
    tags: ["First", "Surreal", "Mechanical", "Classic", "Steampunk"]
  }
];

export const MOCK_COMMENTS: Record<string, VideoComment[]> = {
  "videocites-sintel-cinematic": [
    {
      id: "c1",
      authorName: "Marcus Vance",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      content: "This is hands-down the cleanest render I've seen of Sintel. The dark gradients on Videocites player make it feel like a premium IMAX experience. Absolute perfection.",
      createdAt: "2026-06-28T14:30:00Z",
      likes: 420
    },
    {
      id: "c2",
      authorName: "Elena Rostova",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      content: "The tracing ID on the player is so subtle but a brilliant touch for copyright protection. Truly enterprise-grade hosting platform.",
      createdAt: "2026-06-29T09:15:00Z",
      likes: 185
    },
    {
      id: "c3",
      authorName: "David Kim",
      authorAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
      content: "The emotional depth of this open movie is still unparalleled. Sintel's journey breaks my heart every single time. 😭",
      createdAt: "2026-07-01T21:44:00Z",
      likes: 93
    }
  ],
  "videocites-tears-of-steel": [
    {
      id: "c4",
      authorName: "Sarah Connor",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      content: "The Amsterdam setting mixed with giant combat robots is exactly the cyberpunk aesthetic I live for. Beautiful VFX integration!",
      createdAt: "2026-06-25T11:12:00Z",
      likes: 310
    }
  ],
  "videocites-big-buck-bunny": [
    {
      id: "c5",
      authorName: "Kenji Sato",
      authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
      content: "A legendary short! Testing my new OLED screen on this Videocites platform and the colors are stunningly deep.",
      createdAt: "2026-07-02T16:05:00Z",
      likes: 1420
    }
  ]
};
