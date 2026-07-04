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
    publishedAt: "2025-10-12T08:00:00Z",
    backdatedDate: "2025-09-10T14:30:00Z", // Backdated
    category: "Film & Cinema",
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
    publishedAt: "2025-12-05T10:15:00Z",
    category: "Tech",
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
    publishedAt: "2026-01-20T12:00:00Z",
    category: "Entertainment",
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
    publishedAt: "2026-02-14T16:45:00Z",
    category: "Nature",
    tags: ["4K", "Ambient", "Nature", "Cinematic", "Aerial"]
  },
  {
    id: "videocites-elephants-dream",
    title: "ELEPHANTS DREAM - The First Open Movie Project Remaster",
    description: `# Elephants Dream - A Surreal Exploration
Originally released in 2006 under the codename *Orange*, **Elephants Dream** is a surrealist, steam-punk inspired adventure focusing on the relationship between two characters in a chaotic mechanical world.

### Storyline
Proog and Emo explore a bizarre giant machine world, which changes shape according to Emo's whimsical thoughts, testing Proog's reality boundaries.`,
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
    publishedAt: "2026-03-08T11:20:00Z",
    category: "Gaming",
    tags: ["First", "Surreal", "Mechanical", "Classic", "Steampunk"]
  },
  {
    id: "csgt-bo-qua-xe-qua-kho",
    title: "Traffic Police Overlook Overloaded Cargo Trucks - Investigation Report",
    description: `# Investigative Report: Traffic Patrol Overlooks Overloaded Heavy Cargo Trucks

This documentary exposes the reality on major national highways, where transport patrol units frequently overlook oversized and severely overloaded transport vehicles.

### Report Details:
- **Location:** Major National Highway Arteries
- **Target Vehicles:** Heavy dump trucks and container transporters exceeding legal limits
- **Key Focus:** Real-world footage documenting swift, superficial checks and regulatory gaps in enforcing weight limits.

*This content is exclusively distributed and broadcasted on the secure Videocites DRM platform.*`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
    duration: "08:32",
    author: {
      name: "National Investigative News",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
      subscribers: 4200000,
      verified: true
    },
    realViews: 4520,
    realLikes: 340,
    realDislikes: 2,
    baseViews: 1200000,
    baseLikes: 88000,
    baseDislikes: 1450,
    publishedAt: "2026-04-25T09:00:00Z",
    category: "News & Documentary",
    tags: ["Police", "Overloaded Trucks", "Documentary", "Traffic"]
  },
  {
    id: "videocites-synthwave-music",
    title: "SYNTHWAVE MUSIC - Lo-Fi Beats & Synth Masterpiece (Official Audio)",
    description: `# Lo-Fi & Synthwave Study Beats
A premium high-fidelity instrumental session curated for programming, studying, and creative workflow. Immersive basslines combined with retro-synth soundscapes.

*Videocites exclusive digital rights release.*`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    duration: "04:12",
    author: {
      name: "Videocites Music Group",
      avatar: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=120&q=80",
      subscribers: 120000,
      verified: true
    },
    realViews: 520,
    realLikes: 98,
    realDislikes: 0,
    baseViews: 450000,
    baseLikes: 32000,
    baseDislikes: 80,
    publishedAt: "2026-05-10T08:00:00Z",
    category: "Music",
    tags: ["Lofi", "Synthwave", "Coding Music", "Chill", "Copyright"]
  },
  {
    id: "videocites-drm-masterclass",
    title: "EDUCATION: Cryptography & Modern Digital Rights Management (DRM) Technology",
    description: `# DRM & Digital Copyright Security Masterclass
This lecture series covers the fundamental concepts of cryptography, end-to-end encryption, and the mechanics of modern digital rights management (DRM) platforms used by enterprises today.

### Lecture Highlights:
1. Introduction to Encryption & Decryption keys
2. Dynamic watermark embedding & Anti-camtracing technology
3. The future of high-security digital asset distribution`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    duration: "06:34",
    author: {
      name: "Academy of Digital Security",
      avatar: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=120&q=80",
      subscribers: 75000,
      verified: true
    },
    realViews: 320,
    realLikes: 45,
    realDislikes: 1,
    baseViews: 180000,
    baseLikes: 15400,
    baseDislikes: 42,
    publishedAt: "2026-05-28T10:00:00Z",
    category: "Education",
    tags: ["Education", "Security", "DRM", "Cryptography", "Lecture"]
  },
  {
    id: "videocites-cyber-pulse",
    title: "CYBER PULSE - Neo Tokyo Synthesizer live performance",
    description: `# Cyber Pulse Live Session
An immersive live modular synthesizer performance capturing the cyberpunk atmosphere of futuristic Tokyo nighttime. Engineered for high-end audio displays.

### Performance Gear:
- Eurorack Modular Synth
- Prophet-6 Analog Keyboard
- Moog Sub 37 Bass Engine`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    duration: "05:15",
    author: {
      name: "Tokyo Synth Syndicate",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      subscribers: 310000,
      verified: true
    },
    realViews: 8200,
    realLikes: 680,
    realDislikes: 4,
    baseViews: 412000,
    baseLikes: 29800,
    baseDislikes: 130,
    publishedAt: "2026-06-05T11:00:00Z",
    category: "Music",
    tags: ["Synthwave", "Cyberpunk", "Modular", "Live Music"]
  },
  {
    id: "videocites-deep-dive-space",
    title: "DEEP DIVE SPACE - Quantum Computing and the Multiverse",
    description: `# Quantum Computing & Cosmology
How quantum computer mechanics are revealing new clues about parallel worlds and dark matter distribution in our galaxy.

### Key Segments:
- Superposition in qubits
- The Many-Worlds Interpretation (MWI)
- Galactic gravitational lens rendering`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    duration: "11:42",
    author: {
      name: "Cosmos Tech Lab",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      subscribers: 1100000,
      verified: true
    },
    realViews: 14500,
    realLikes: 1150,
    realDislikes: 12,
    baseViews: 2450000,
    baseLikes: 185000,
    baseDislikes: 920,
    publishedAt: "2026-06-12T14:30:00Z",
    category: "Tech",
    tags: ["Quantum", "Space", "Cosmology", "Physics", "SciFi"]
  },
  {
    id: "videocites-wildlife-patagonia",
    title: "WILD PATAGONIA - Untamed Wilderness & Scenic Aerials",
    description: `# Untamed Patagonia
Experience the cold glaciers, steep rocky mountains, and incredible wildlife of southernmost South America in extreme high contrast.

### Wildlife Featured:
- Andean Condor
- Guanaco Herds
- Southern Right Whale`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    duration: "07:20",
    author: {
      name: "Aetherial Films",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
      subscribers: 310000,
      verified: true
    },
    realViews: 2100,
    realLikes: 198,
    realDislikes: 2,
    baseViews: 195000,
    baseLikes: 14200,
    baseDislikes: 54,
    publishedAt: "2026-06-18T18:00:00Z",
    category: "Nature",
    tags: ["Patagonia", "Nature", "Wilderness", "Drone", "Glacier"]
  },
  {
    id: "videocites-ai-renaissance",
    title: "AI RENAISSANCE - Generative Art & Creative Algorithms",
    description: `# The Creative Code Era
An investigation into the rapid rise of algorithmic artists, diffusion models, and whether machine intelligence can possess genuine artistic intuition.

### Discussion points:
- Neural style transfer mechanics
- Latent space navigation
- Copyright laws in the algorithmic era`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    duration: "09:05",
    author: {
      name: "Digital Security Academy",
      avatar: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=120&q=80",
      subscribers: 75000,
      verified: true
    },
    realViews: 1250,
    realLikes: 89,
    realDislikes: 0,
    baseViews: 140000,
    baseLikes: 11000,
    baseDislikes: 25,
    publishedAt: "2026-06-24T02:00:00Z",
    category: "Education",
    tags: ["AI", "Generative Art", "Machine Learning", "Philosophy"]
  },
  {
    id: "videocites-gaming-unreal5",
    title: "NEXT GEN GAMING - Unreal Engine 5 Real-time Cinematic Demo",
    description: `# Unreal Engine 5.5 Visuals
Check out this real-time photorealistic environment render running smoothly at 60FPS. Built with Lumen dynamic global illumination and Nanite virtualized geometry.

### Specs:
- Built in Unreal Engine 5.5
- Tested on RTX 4090 GPU`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    duration: "04:50",
    author: {
      name: "Blender Comedy Division",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
      subscribers: 1540000,
      verified: true
    },
    realViews: 24500,
    realLikes: 2100,
    realDislikes: 18,
    baseViews: 1850000,
    baseLikes: 152000,
    baseDislikes: 720,
    publishedAt: "2026-06-28T05:30:00Z",
    category: "Gaming",
    tags: ["UE5", "Unreal Engine", "RTX", "Graphics", "60FPS"]
  },
  {
    id: "videocites-street-food-vietnam",
    title: "STREET FOOD VIETNAM - Culinary Journeys through Hanoi Old Quarter",
    description: `# Hanoi Street Food Chronicles
Join us as we explore the best hidden alleyways of Hanoi to find authentic Bún Chả, Phở Bò, and Egg Coffee prepared by multi-generational families.

### Dishes Highlighted:
- Pho Bo Ly Quoc Su (Beef Noodle)
- Bun Cha Hang Than (Grilled Pork Noodle)
- Giang Egg Coffee`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
    duration: "15:10",
    author: {
      name: "Neo Amsterdam Studios",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      subscribers: 890000,
      verified: true
    },
    realViews: 3200,
    realLikes: 240,
    realDislikes: 1,
    baseViews: 420000,
    baseLikes: 35000,
    baseDislikes: 110,
    publishedAt: "2026-06-30T07:15:00Z",
    category: "Entertainment",
    tags: ["Street Food", "Vietnam", "Hanoi", "Culinary", "Vlog"]
  },
  {
    id: "videocites-urban-flow",
    title: "URBAN FLOW - Timelapse Studies of Super-connected Smart Cities",
    description: `# Urban Flow & Traffic Patterns
A deeply mesmerizing visual documentary capturing the continuous kinetic energy of modern transit systems, high-speed rail, and smart intersections in Singapore.

### Camera Details:
- Shot on RED V-Raptor 8K
- Starlight ND Filters
- Motion-controlled track sliders`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    duration: "08:15",
    author: {
      name: "Global Documentary Channels",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
      subscribers: 4200000,
      verified: true
    },
    realViews: 1980,
    realLikes: 145,
    realDislikes: 1,
    baseViews: 750000,
    baseLikes: 52000,
    baseDislikes: 210,
    publishedAt: "2026-07-01T08:00:00Z",
    category: "News & Documentary",
    tags: ["Smart City", "Timelapse", "Singapore", "Documentary", "Cinematic"]
  },
  {
    id: "videocites-retro-arcade",
    title: "RETRO ARCADE - The Rise and Fall of Coin-operated Cabinets",
    description: `# Arcade Gaming History
The fascinating story of how arcade lounges became the ultimate neon hubs of late-20th-century youth culture, and why domestic console systems eventually replaced them.

### Featured Games:
- Pac-Man (1980)
- Street Fighter II (1991)
- Time Crisis (1995)`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=1200&q=80",
    duration: "12:30",
    author: {
      name: "Blender Cinematic Corp",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
      subscribers: 2450000,
      verified: true
    },
    realViews: 3400,
    realLikes: 310,
    realDislikes: 2,
    baseViews: 580000,
    baseLikes: 46000,
    baseDislikes: 180,
    publishedAt: "2026-07-02T09:30:00Z",
    category: "Gaming",
    tags: ["Arcade", "Retro", "History", "Pacman", "Cabinets"]
  },
  {
    id: "videocites-ambient-waves",
    title: "AMBIENT WAVES - Relaxing Ocean Sounds & Coastal Sunset Drone",
    description: `# Ambient Ocean Scenery
Unwind with beautiful aerial views of soft ocean waves rolling onto warm sandy beaches at golden hour. Perfect background track for concentration, meditation, or sleeping.

### Location:
- Kauai Coastline, Hawaii`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80",
    duration: "20:00",
    author: {
      name: "Aetherial Films",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
      subscribers: 310000,
      verified: true
    },
    realViews: 5400,
    realLikes: 480,
    realDislikes: 3,
    baseViews: 850000,
    baseLikes: 68000,
    baseDislikes: 110,
    publishedAt: "2026-07-03T10:00:00Z",
    category: "Nature",
    tags: ["Ocean", "Sunset", "Hawaii", "Ambient", "Sleep"]
  },
  {
    id: "videocites-future-mobility",
    title: "FUTURE MOBILITY - Autonomous EV Technology & Aerodynamics",
    description: `# Future of Transportation
An in-depth look at state-of-the-art battery chemistries, ultra-low drag coefficients, and how high-performance computing power drives autonomous sensor suites.

### Technical Deep Dive:
- Solid-state battery thermal metrics
- LiDAR & Radar sensor fusion
- Generative aerodynamic design`,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
    duration: "06:18",
    author: {
      name: "Cosmos Tech Lab",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      subscribers: 1100000,
      verified: true
    },
    realViews: 4100,
    realLikes: 380,
    realDislikes: 5,
    baseViews: 320000,
    baseLikes: 26000,
    baseDislikes: 140,
    publishedAt: "2026-07-04T05:00:00Z",
    category: "Tech",
    tags: ["EV", "Electric Car", "Autonomous", "LiDAR", "Aerodynamics"]
  }
];

export const MOCK_COMMENTS: Record<string, VideoComment[]> = {
  "csgt-bo-qua-xe-qua-kho": [
    {
      id: "cc1",
      authorName: "Alexander Carter",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      content: "This report is so realistic and detailed! Overloaded trucks are destroying the public highway infrastructure, yet enforcement is so superficial.",
      createdAt: "2026-06-30T10:15:00Z",
      likes: 520
    },
    {
      id: "cc2",
      authorName: "Chloe Bennett",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      content: "Kudos to the investigative journalists for bravely filming this on-site. Hopefully, local authorities will step in to resolve this strictly.",
      createdAt: "2026-06-30T11:45:00Z",
      likes: 230
    }
  ],
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
