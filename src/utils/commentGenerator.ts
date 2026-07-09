import { Video, VideoComment } from "../types";

// Realistic names for International commentators
const USER_POOL = [
  { name: "Liam Carter", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" },
  { name: "Olivia Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
  { name: "Ethan Davis", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80" },
  { name: "Mason Miller", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
  { name: "Noah Wilson", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=120&q=80" },
  { name: "Sophia Taylor", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" },
  { name: "Isabella Anderson", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
  { name: "Lucas Thomas", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80" },
  { name: "Jackson Moore", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80" },
  { name: "Aiden Martin", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80" },
  { name: "Sarah Jenkins", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" },
  { name: "David Miller", avatar: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=120&q=80" },
  { name: "Alex Mercer", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80" },
  { name: "Emma Watson", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80" },
  { name: "Aiko Tanaka", avatar: "https://images.unsplash.com/photo-1526080652727-5b77f74eacd2?auto=format&fit=crop&w=120&q=80" },
  { name: "Michael Smith", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80" },
  { name: "Emily Johnson", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=120&q=80" },
  { name: "Sophia Martinez", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&q=80" },
  { name: "Daniel Lee", avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=120&q=80" },
  { name: "Jessica Brown", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80" },
  { name: "Oliver Davies", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
  { name: "Amélie Laurent", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=120&q=80" },
  { name: "Chloe Thompson", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" },
  { name: "Liam Gallagher", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80" },
  { name: "Logan Jackson", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80" },
  { name: "James White", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
  { name: "Harper Harris", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
  { name: "Benjamin Martin", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=120&q=80" },
  { name: "Elijah Thompson", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80" },
  { name: "Mia Garcia", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" }
];

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Category-based templates for general interest comments
const CATEGORY_TEMPLATES: Record<string, { vi: string[]; en: string[] }> = {
  "Music": {
    vi: [
      "This melody is absolutely wonderful, listening to it on repeat and never getting tired of it!",
      "Videocites' audio system sounds genuinely high quality, the bass is super solid.",
      "Anyone else listening to this track in the middle of the night like me?",
      "Such a talented artist, hoping for more new releases soon.",
      "This music is really chill, perfect for focusing on work or coding.",
      "Absolute masterpiece! Liked and subscribed to the channel.",
      "The vibe of this song is insane, feels so relaxing.",
      "The perfect combination of sound and visual engineering."
    ],
    en: [
      "This melody is absolutely breathtaking. On repeat for hours!",
      "The audio quality on this player is outstanding. Super crisp highs.",
      "Who else is listening to this in 2026? Such a masterpiece.",
      "The synthesizers here are perfectly mixed. Pure eargasm.",
      "This beat is so clean. Definitely adding to my late night coding playlist.",
      "Incredible performance! Truly talented artist.",
      "The visualizer matches the atmospheric tone perfectly."
    ]
  },
  "Tech": {
    vi: [
      "Technology is changing so rapidly, it's absolutely mind-blowing.",
      "Extremely deep and practical analysis, thank you to the author.",
      "This device's performance is stellar, though it probably doesn't come cheap.",
      "Anyone using this device currently? I would love a practical review.",
      "A high-level tech breakthrough! Very exciting for the near future.",
      "The AI era is coming fast; constant learning is key to survival.",
      "This explanation is super easy to grasp, even for a non-expert like me.",
      "I love the clear, coherent presentation of information backed by solid proof."
    ],
    en: [
      "The engineering depth behind this technology is mind-blowing.",
      "Fascinating analysis! Very rare to find such high-quality hardware reviews.",
      "The performance numbers here are impressive. Can't wait for retail launch.",
      "This will disrupt the entire industry. Incredible forward-looking concepts.",
      "Outstanding breakdown. Learned so much from this single video.",
      "The transition to these new protocols makes total sense.",
      "Superb explanation of quantum and neural systems."
    ]
  },
  "Gaming": {
    vi: [
      "Gaming graphics these days are incredible, it literally looks like real life.",
      "Absolutely top-tier mechanical skills, learned so many tricks from watching.",
      "What are the minimum system requirements for this game, guys?",
      "Such an incredibly satisfying match, that comeback was unbelievable!",
      "Nostalgia hits hard seeing these legendary game titles again.",
      "Can't wait for this game to be officially released so I can play it.",
      "Very creative gameplay, I never would have thought of this approach.",
      "Looks butter smooth and pleasing to the eye, 60FPS makes a huge difference."
    ],
    en: [
      "The graphics are getting too realistic! Unreal Engine is insane.",
      "Top-tier mechanics. That clutch play at the end was unbelievable!",
      "What a nostalgic trip down memory lane. Legendary game.",
      "I've played this for 100+ hours and still learned a new trick from you.",
      "Butter smooth gameplay. Videocites video player handles fast motion great.",
      "Is this running on a custom engine or Unity? The lighting is beautiful.",
      "Absolutely brilliant strategy. Subscribed for more gaming content."
    ]
  },
  "Education": {
    vi: [
      "An incredibly useful and concise lecture, the explanation is so easy to absorb.",
      "I wish school lessons were taught with such visual clarity back in my days.",
      "An invaluable reference resource for studies and academic research.",
      "Thank you for the passionate academic sharing by the team.",
      "This knowledge is very practical and highly applicable to my current work.",
      "Watching this on repeat and still finding it amazing. Eagerly waiting for the next lessons.",
      "Explaining complex theories in such a simple and easy-to-understand way.",
      "A rare high-quality educational channel that stays true to core values."
    ],
    en: [
      "An exceptionally well-researched educational resource. Kudos!",
      "I wish my university professors explained subjects with this level of clarity.",
      "Highly informative! This cleared up so many doubts I had.",
      "Beautifully animated and visually organized. Perfect for visual learners.",
      "The cryptographic explanations here are so elegant.",
      "An absolute masterclass in science communication.",
      "Thank you for sharing this knowledge with the public for free!"
    ]
  },
  "News & Documentary": {
    vi: [
      "A deeply authentic report that truly reflects the current reality.",
      "Highly appreciate the crew's dangerous on-site filming efforts.",
      "Incredibly beneficial information that needs to be widely shared with the community.",
      "A very multi-dimensional and objective perspective, completely unbiased.",
      "Watching this leaves me with so many profound thoughts about life.",
      "Thank you to the brave journalists speaking up for the absolute truth.",
      "Superb editing, the sound design guides the viewer's emotions perfectly."
    ],
    en: [
      "This is what real investigative journalism looks like. Remarkable.",
      "Stunning footage. The documentary style is incredibly immersive.",
      "An eye-opening expose. Thank you for shedding light on this issue.",
      "Extremely well produced and professional. Deserves a broadcasting award.",
      "The editing and progression of this report kept me hooked from start to finish.",
      "Deeply moving and objective storytelling."
    ]
  },
  "Entertainment": {
    vi: [
      "Laughed so hard at these memes, absolutely hilarious and charming!",
      "This is perfect for weekend entertainment, washes away all the exhaustion.",
      "Brilliant video editing, extremely engaging and impossible to look away.",
      "Top-tier acting, the facial expressions are incredibly natural.",
      "Crazy creative content, watching this on repeat and it's still hilarious.",
      "This channel produces clean entertainment, very refreshing for the mind.",
      "A perfect blend of artistry and humor. Wishing the team continued growth!"
    ],
    en: [
      "This is pure gold! Laughed so hard my cheeks hurt.",
      "The comedic timing in this video is absolutely impeccable.",
      "Such a high-production entertainment piece. Love the vibes!",
      "This deserves millions of views. Instant classic.",
      "Incredibly creative editing. The fast pace keeps you fully engaged.",
      "Can't stop rewatching! The chemistry here is perfect."
    ]
  },
  "Nature": {
    vi: [
      "Wild nature is spectacularly majestic and absolutely breathtaking.",
      "The 4K resolution on my display looks incredibly sharp down to every blade of grass.",
      "Makes you feel so small in front of the sheer greatness of nature.",
      "Stunning drone cinematography, such an expansive and beautiful perspective.",
      "This video is excellent for stress relief after a long and hectic day.",
      "I wish I could set foot on this pristine, wild land at least once.",
      "The background score blends flawlessly with the sounds of waves and wind."
    ],
    en: [
      "Mother Nature is the ultimate artist. Truly breathtaking shots.",
      "The color grading on these forest and ocean scenes is masterful.",
      "Stunning drone footage! What camera gear was used to capture this?",
      "So peaceful and calming. Watching this after a hectic day is therapeutic.",
      "We must do everything we can to preserve these wild environments.",
      "The crisp sound design makes me feel like I am standing right there."
    ]
  },
  "Film & Cinema": {
    vi: [
      "Outstanding cinematic visual effects, looks incredibly smooth and epic.",
      "The camera angles and lighting are extremely artistic, true cinematic standard.",
      "A short story but filled with human depth, left me quite emotional.",
      "An exceptional short film in both visual execution and soundscapes.",
      "Deeply admire the screenwriter and director's talent in this masterpiece.",
      "The color grading of this film is beautiful, adding rich artistic depth."
    ],
    en: [
      "The cinematography here is world-class. Every frame is a painting.",
      "Stunning CGI work! Blender community is showing what is possible.",
      "What an emotional rollercoaster in just a few minutes. Masterful storytelling.",
      "The atmospheric depth and lightning design are absolutely incredible.",
      "This is cinema. Incredible passion project.",
      "Brilliant soundscapes. The orchestral score matches the emotional beats."
    ]
  }
};

// Caption/Description keywords extractor to generate specialized matching comments
const CAPTION_KEYWORD_TEMPLATES = [
  {
    keywords: ["hanoi", "hà nội", "bún chả", "phở", "street food", "ẩm thực"],
    vi: [
      "Craving Hanoi's Bun Cha and Pho so much! Watching this makes me want to pack my bags and go.",
      "Hanoi's culinary heritage is so ancient and sophisticated. Super high-quality video.",
      "The 36 streets of Hanoi have some legendary traditional eateries.",
      "Seeing that steaming bowl of beef Pho is mouthwatering. Definitely a must-try in Hanoi."
    ],
    en: [
      "Hanoi street food is legendary! I dream about authentic Pho and Bun Cha every day.",
      "This looks absolutely mouthwatering. Vietnamese cuisine is unmatched.",
      "The Old Quarter has some of the best hidden culinary gems in Asia.",
      "Excellent guide to Hanoi food culture. Added to my travel bucket list!"
    ]
  },
  {
    keywords: ["unreal", "ue5", "nanite", "lumen", "game engine", "rtx"],
    vi: [
      "Unreal Engine 5 is truly a gaming graphics revolution.",
      "Lumen real-time global illumination technology looks absolutely stunning.",
      "Running this game's specs will probably make RTX cards sweat quite a bit.",
      "The Nanite material detail close-up is flawless, not a single jagged edge in sight."
    ],
    en: [
      "Unreal Engine 5.5 nanite geometry processing is absolute witchcraft.",
      "The global illumination from Lumen makes pre-baked lighting obsolete.",
      "Tested this on an RTX 4080 and it looks incredibly sharp and lifelike.",
      "Epic Games is pushing real-time rendering boundaries further than anyone else."
    ]
  },
  {
    keywords: ["synth", "synthesizer", "analog", "modular", "moog", "lofi"],
    vi: [
      "That Eurorack Modular setup is so slick, the sounds are perfectly synchronized.",
      "Moog Sub 37 produces such deep bass frequencies, you can feel it in your chest.",
      "Analog music always has a very characteristic warmth and raw texture.",
      "Extremely chill! The studio setup looks very high-tech and futuristic."
    ],
    en: [
      "That modular synth rig must cost a fortune. Absolutely brilliant sound design!",
      "Nothing beats the warmth of authentic analog filters. Prophet-6 is amazing.",
      "This synth patch is so spacious. Beautiful low-end warm frequency.",
      "An incredibly clean live jam. Your eurorack routing is absolute genius."
    ]
  },
  {
    keywords: ["quantum", "comput", "lượng tử", "máy tính"],
    vi: [
      "Quantum computers will solve mathematical problems that today's supercomputers can't handle.",
      "Quantum mechanics is truly mind-bending, but this video illustrates it so clearly.",
      "Qubit superposition works in such a magical way, right on the border of science and fiction."
    ],
    en: [
      "Quantum superposition is such a mind-bending concept, explained beautifully.",
      "This is the real frontier of computing. Excellent breakdown on qubits.",
      "Understanding quantum mechanics through visual rendering is incredibly helpful."
    ]
  },
  {
    keywords: ["patagonia", "glacier", "mountain", "hoang dã", "sông băng"],
    vi: [
      "Patagonia is so grand, looking at those massive glaciers gives me goosebumps.",
      "The drone flies so close to the steep cliffs, extremely skilled piloting.",
      "Pristine natural landscapes with no human footprint, absolutely magnificent."
    ],
    en: [
      "Patagonia has the most dramatic mountain peaks in the world. Stunning aerials.",
      "The sheer scale of those glaciers is terrifying and majestic at the same time.",
      "Incredible camera work! Capturing wildlife in these freezing conditions is tough."
    ]
  },
  {
    keywords: ["ai", "generative", "algorithm", "thuật toán", "trí tuệ nhân tạo"],
    vi: [
      "Artificial intelligence is blurring the line between science, technology, and art.",
      "Artwork created by algorithms has real depth, though it still lacks a human touch.",
      "The topic of AI copyright is incredibly hot right now.",
      "The more I watch, the more I see humanity's future closely linked with AI."
    ],
    en: [
      "Can algorithms possess genuine creativity? Such a profound philosophical query.",
      "The latent space walkthrough was visually outstanding and helpful.",
      "AI art is a powerful amplifier for human artists, not just a replacement.",
      "Excellent overview of diffusion models and neural networks."
    ]
  },
  {
    keywords: ["csgt", "giao thông", "quá khổ", "quá tải", "xe tải"],
    vi: [
      "These overloaded trucks completely destroy the road infrastructure, they deserve heavy fines.",
      "The traffic patrol force working diligently like this makes the public feel much safer.",
      "Excellent undercover camera work, exposing many illegal traffic behaviors."
    ],
    en: [
      "Excellent undercover work highlighting the danger of overloaded cargo trucks.",
      "Safety on public roads is paramount. Great report on traffic regulations.",
      "These heavy trucks completely destroy the infrastructure. Strict fines are necessary."
    ]
  }
];

// Fallback comments that mention the caption or description directly
const CAPTION_FALLBACK_TEMPLATES = {
  vi: [
    "Reading the detailed description reveals the true dedication of the creator.",
    "The video description is so informative and useful, thanks for sharing.",
    "The content perfectly matches what is written in the caption.",
    "I love how detailed the explanation is in the description section.",
    "The caption has some incredibly deep research and insights.",
    "Reading the notes shows how much meticulous effort the author invested."
  ],
  en: [
    "The description has some really cool insights. Thanks for sharing!",
    "I love how detailed the caption is. It really adds to the viewing experience.",
    "Very detailed breakdown in the description! Appreciate the extra info.",
    "Reading the description before watching helped me grasp the concepts so much better.",
    "Excellent caption notes. Shows the high level of research put into this video."
  ]
};

// Helper to clean up video titles (stripping file extensions, etc)
export function cleanVideoTitle(title: string): string {
  if (!title) return "this video";
  return title
    .replace(/\.(mp4|mkv|avi|mov|webm)$/i, "")
    .replace(/\[Official (Video|Audio|Music Video|MV)\]/gi, "")
    .replace(/\(Official (Video|Audio|Music Video|MV)\)/gi, "")
    .replace(/\[MV\]/gi, "")
    .replace(/\(MV\)/gi, "")
    .replace(/\(Full HD\)/gi, "")
    .replace(/\(4K\)/gi, "")
    .replace(/\[4K\]/gi, "")
    .replace(/\|\s*Videocites/gi, "")
    .trim();
}

// Generate a pool of highly contextual, specific templates using the video's title/category
export function getDynamicContextualComments(video: Video): { vi: string[]; en: string[] } {
  const cleanTitle = cleanVideoTitle(video.title);
  const tagsText = video.tags && video.tags.length > 0 ? video.tags.slice(0, 3).join(", ") : video.category;

  const vi = [
    `Nội dung về "${cleanTitle}" này hay quá, xem đi xem lại vẫn thấy cực kỳ cuốn hút!`,
    `Đúng là chủ đề mình đang tìm kiếm: "${cleanTitle}". Video giải thích siêu chi tiết luôn, cảm ơn kênh!`,
    `Cảnh quay và thông tin về "${cleanTitle}" được đầu tư quá công phu, đúng chuẩn chất lượng cao.`,
    `Phân tích về "${cleanTitle}" rất sâu sắc và có chiều sâu, cực kỳ thuyết phục.`,
    `Xem xong video về "${cleanTitle}" này thấy hiểu ra nhiều điều, hữu ích dã man!`,
    `Thích cách tiếp cận vấn đề của video "${cleanTitle}", không bị rập khuôn hay nhàm chán chút nào.`,
    `Mong chờ kênh làm thêm nhiều video cùng chủ đề như "${cleanTitle}" hoặc về ${tagsText}!`,
    `Không uổng công click vào xem, nội dung "${cleanTitle}" quá đỉnh, xứng đáng triệu view.`,
    `Cách trình bày về "${cleanTitle}" rất dễ hiểu, súc tích và mạch lạc ghê.`,
    `Cảm ơn tác giả đã chia sẻ một sản phẩm xuất sắc như video "${cleanTitle}" này. Đã subscribe!`,
    `Vừa nghe vừa ngẫm nghĩ về "${cleanTitle}", thấy tác giả nghiên cứu cực kỳ kỹ lưỡng.`,
    `Những điểm nhấn trong "${cleanTitle}" thực sự đắt giá, khâm phục cách làm nội dung của ê-kíp.`
  ];

  const en = [
    `The breakdown of "${cleanTitle}" is absolutely brilliant, learned so much from this!`,
    `I've been looking for a comprehensive video about "${cleanTitle}" for a long time. This is perfect!`,
    `The visual and explanation quality in this video about "${cleanTitle}" is top-tier.`,
    `So well researched! Your analysis of "${cleanTitle}" has some incredible depth.`,
    `Watching this video about "${cleanTitle}" makes me appreciate your hard work even more.`,
    `The editing is seamless and the way you presented "${cleanTitle}" is extremely engaging.`,
    `Such clean presentation and valuable info on "${cleanTitle}". Highly recommended!`,
    `This deserves millions of views! Exceptional quality on the topic of "${cleanTitle}".`,
    `I love how simply and beautifully you explained "${cleanTitle}". Subscribed!`,
    `A masterclass on "${cleanTitle}"! Thanks for sharing this useful content.`,
    `Everything in this video about "${cleanTitle}" is perfectly structured and clear.`,
    `A very multi-dimensional perspective on "${cleanTitle}". Amazing work!`
  ];

  return { vi, en };
}

// Generate a single random contextual comment
export function generateSingleContextualComment(video: Video, isVi = false): { authorName: string; authorAvatar: string; content: string } {
  const selectedUsers = shuffleArray(USER_POOL);
  const user = selectedUsers[Math.floor(Math.random() * selectedUsers.length)];
  const pool = getDynamicContextualComments(video);
  const commentsList = isVi ? pool.vi : pool.en;
  const content = commentsList[Math.floor(Math.random() * commentsList.length)];
  
  return {
    authorName: user.name,
    authorAvatar: user.avatar,
    content
  };
}

// Generate 20-30 comments for a given video
export function generateCommentsForVideo(video: Video, count = 25): VideoComment[] {
  const generated: VideoComment[] = [];
  const selectedUsers = shuffleArray(USER_POOL);
  
  // 1. Gather all potential templates
  let candidateVi: string[] = [];
  let candidateEn: string[] = [];

  // Match keyword templates from the caption/description/title
  const combinedText = `${video.title} ${video.description || ""} ${video.tags.join(" ")}`.toLowerCase();
  
  let keywordMatched = false;
  for (const item of CAPTION_KEYWORD_TEMPLATES) {
    const matches = item.keywords.some(keyword => combinedText.includes(keyword));
    if (matches) {
      candidateVi.push(...item.vi);
      candidateEn.push(...item.en);
      keywordMatched = true;
    }
  }

  // Also include general category templates
  const categoryGroup = CATEGORY_TEMPLATES[video.category] || CATEGORY_TEMPLATES["Film & Cinema"];
  candidateVi.push(...categoryGroup.vi);
  candidateEn.push(...categoryGroup.en);

  // Add highly contextual title-specific comments
  const dynamicPool = getDynamicContextualComments(video);
  candidateVi.push(...dynamicPool.vi);
  candidateEn.push(...dynamicPool.en);

  // If keyword matches exist, prioritize them, but also add caption fallback templates
  candidateVi.push(...CAPTION_FALLBACK_TEMPLATES.vi);
  candidateEn.push(...CAPTION_FALLBACK_TEMPLATES.en);

  // De-duplicate candidate lists
  candidateVi = Array.from(new Set(candidateVi));
  candidateEn = Array.from(new Set(candidateEn));

  // Determine ratio of Vietnamese to English comments (100% English)
  const viWeight = 0; // Force 100% English comments

  // Setup date range
  const pubDate = new Date(video.publishedAt);
  const now = new Date("2026-07-04T11:30:00Z"); // fixed simulated current time

  // Shuffle candidates
  const shuffledVi = shuffleArray(candidateVi);
  const shuffledEn = shuffleArray(candidateEn);

  let viIdx = 0;
  let enIdx = 0;

  for (let i = 0; i < count; i++) {
    const user = selectedUsers[i % selectedUsers.length];
    
    // Pick language (always English)
    const isVi = false;
    let content = "";

    if (isVi) {
      if (viIdx >= shuffledVi.length) viIdx = 0;
      content = shuffledVi[viIdx++];
    } else {
      if (enIdx >= shuffledEn.length) enIdx = 0;
      content = shuffledEn[enIdx++];
    }

    // Set realistic timestamp after publishedAt but before now
    const pubTimeMs = pubDate.getTime();
    const nowMs = now.getTime();
    const diffMs = Math.max(10 * 60 * 1000, nowMs - pubTimeMs); // minimum 10 mins apart

    // Divide the entire lifetime of the video into 'count' segments
    // and randomly position each comment's date inside its respective segment.
    // This perfectly scatters ("rải rác") the comments across the video's history.
    const segmentWidth = diffMs / count;
    const segmentStart = pubTimeMs + (i * segmentWidth);
    const randomOffsetInSegment = Math.random() * segmentWidth;
    const commentDate = new Date(segmentStart + randomOffsetInSegment);

    // Set randomized likes favoring older comments
    const ageFactor = (nowMs - commentDate.getTime()) / (24 * 60 * 60 * 1000); // age in days
    const maxLikes = Math.floor(Math.log10(video.baseViews + 10) * 12);
    const baseLikes = Math.floor(Math.random() * maxLikes);
    const likes = Math.floor(baseLikes * (0.3 + 0.7 * Math.min(1, ageFactor)));

    generated.push({
      id: `generated-cmt-${video.id}-${i}`,
      authorName: user.name,
      authorAvatar: user.avatar,
      content,
      createdAt: commentDate.toISOString(),
      likes
    });
  }

  // Sort comments by likes desc (or date) to make it beautiful
  return generated.sort((a, b) => b.likes - a.likes);
}

export function sanitizeAndTranslateComment(comment: any): any {
  if (!comment) return comment;
  const content = comment.content || "";
  const authorName = comment.authorName || "";

  // 1. Translate Vietnamese commenter names to English names
  let updatedName = authorName;
  const viNamesMap: Record<string, string> = {
    "Khán giả ẩn danh": "Anonymous Viewer",
    "Nguyễn Văn A": "Andrew Nguyen",
    "Trần Thị B": "Beatrice Tran",
    "Lê Hoàng Nam": "Nathan Le",
    "Phạm Minh Đức": "Dominic Pham",
    "Vũ Hoàng Anh": "Arthur Vu",
    "Hoàng Gia Bảo": "Gabriel Hoang"
  };
  
  if (viNamesMap[authorName]) {
    updatedName = viNamesMap[authorName];
  } else {
    // Detect typical Vietnamese diacritics in name and replace with English-sounding name
    const hasViDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(authorName);
    if (hasViDiacritics) {
      // Pick a deterministic foreign name based on the string hash
      const defaultNames = [
        "Liam Carter", "Olivia Johnson", "Ethan Davis", "Sophia Taylor", 
        "Mason Miller", "Emma Watson", "Alex Mercer", "Chloe Thompson"
      ];
      let sum = 0;
      for (let i = 0; i < authorName.length; i++) {
        sum += authorName.charCodeAt(i);
      }
      updatedName = defaultNames[sum % defaultNames.length];
    }
  }

  // 2. Map exact Vietnamese comment content to English translations
  let updatedContent = content;
  const translationMap: Record<string, string> = {
    "Giai điệu này quá tuyệt vời, nghe lặp đi lặp lại không chán!": "This melody is absolutely wonderful, listening to it on repeat and never getting tired of it!",
    "Hệ thống âm thanh của Videocites nghe chất lượng thật, âm bass rất chắc.": "Videocites' audio system sounds genuinely high quality, the bass is super solid.",
    "Có ai nghe bài này lúc nửa đêm giống mình không?": "Anyone else listening to this track in the middle of the night like me?",
    "Nghệ sĩ tài năng quá, hy vọng sẽ sớm ra thêm nhiều tác phẩm mới.": "Such a talented artist, hoping for more new releases soon.",
    "Nhạc chill thật sự, cực kỳ thích hợp để tập trung làm việc hoặc code.": "This music is really chill, perfect for focusing on work or coding.",
    "Tuyệt phẩm! Đã thả tim và đăng ký kênh.": "Absolute masterpiece! Liked and subscribed to the channel.",
    "Vibe bài này đỉnh dã man, nghe xong thấy tâm hồn thư thái hẳn.": "The vibe of this song is insane, feels so relaxing.",
    "Sự kết hợp hoàn hảo giữa âm thanh và hình ảnh.": "The perfect combination of sound and visual engineering.",
    "Công nghệ đang thay đổi nhanh chóng thật, xem mà ngỡ ngàng.": "Technology is changing so rapidly, it's absolutely mind-blowing.",
    "Phân tích cực kỳ có chiều sâu và thực tế, cảm ơn tác giả.": "Extremely deep and practical analysis, thank you to the author.",
    "Thiết bị này hiệu năng đỉnh quá nhưng giá chắc không hề rẻ chút nào.": "This device's performance is stellar, though it probably doesn't come cheap.",
    "Có ai đang sử dụng sản phẩm này cho mình xin tí review thực tế với.": "Anyone using this device currently? I would love a practical review.",
    "Đột phá công nghệ đỉnh cao! Rất đáng mong chờ trong tương lai.": "A high-level tech breakthrough! Very exciting for the near future.",
    "Sắp tới kỷ nguyên của AI rồi, học hỏi liên tục không là bị đào thải ngay.": "The AI era is coming fast; constant learning is key to survival.",
    "Video giải thích cực kỳ dễ hiểu cho những người ngoại đạo như mình.": "This explanation is super easy to grasp, even for a non-expert like me.",
    "Thích cách trình bày thông tin mạch lạc, rõ ràng và có dẫn chứng.": "I love the clear, coherent presentation of information backed by solid proof.",
    "Đồ họa game thời nay đỉnh thật, nhìn như đời thực luôn.": "Gaming graphics these days are incredible, it literally looks like real life.",
    "Kỹ năng xử lý đỉnh cao quá, xem mà học hỏi được bao nhiêu thứ.": "Absolutely top-tier mechanical skills, learned so many tricks from watching.",
    "Game này cấu hình tối thiểu thế nào vậy mọi người ơi?": "What are the minimum system requirements for this game, guys?",
    "Trận đấu mãn nhãn thật sự, pha lật kèo không thể tin nổi!": "Such an incredibly satisfying match, that comeback was unbelievable!",
    "Tuổi thơ ùa về khi nhìn thấy những tựa game này.": "Nostalgia hits hard seeing these legendary game titles again.",
    "Chờ đợi ngày game này chính thức phát hành để trải nghiệm.": "Can't wait for this game to be officially released so I can play it.",
    "Cách chơi sáng tạo quá, mình chưa từng nghĩ tới hướng tiếp cận này.": "Very creative gameplay, I never would have thought of this approach.",
    "Nhìn mượt mà thích mắt ghê, 60FPS chuẩn chỉ có khác.": "Looks butter smooth and pleasing to the eye, 60FPS makes a huge difference.",
    "Bài giảng vô cùng bổ ích và súc tích, thầy giải thích rất dễ tiếp thu.": "An incredibly useful and concise lecture, the explanation is so easy to absorb.",
    "Giá như ngày xưa đi học được dạy một cách trực quan thế này.": "I wish school lessons were taught with such visual clarity back in my days.",
    "Tài liệu tham khảo quý giá cho việc học tập và nghiên cứu.": "An invaluable reference resource for studies and academic research.",
    "Cảm ơn những chia sẻ học thuật đầy tâm huyết của đội ngũ.": "Thank you for the passionate academic sharing by the team.",
    "Kiến thức này rất thực tế, giúp ích rất nhiều cho công việc hiện tại của mình.": "This knowledge is very practical and highly applicable to my current work.",
    "Xem đi xem lại vẫn thấy hay. Rất mong chờ các bài học tiếp theo.": "Watching this on repeat and still finding it amazing. Eagerly waiting for the next lessons.",
    "Giải thích các định lý phức tạp một cách cực kỳ đơn giản và dễ hiểu.": "Explaining complex theories in such a simple and easy-to-understand way.",
    "Một kênh giáo dục chất lượng cao hiếm hoi giữ được giá trị cốt lõi.": "A rare high-quality educational channel that stays true to core values.",
    "Phóng sự chân thực, phản ánh đúng thực trạng hiện nay.": "A deeply authentic report that truly reflects the current reality.",
    "Rất trân trọng nỗ lực ghi hình thực tế đầy nguy hiểm của ê kíp.": "Highly appreciate the crew's dangerous on-site filming efforts.",
    "Thông tin vô cùng bổ ích, cần lan tỏa rộng rãi hơn đến cộng đồng.": "Incredibly beneficial information that needs to be widely shared with the community.",
    "Góc nhìn rất đa chiều và khách quan, không hề áp đặt.": "A very multi-dimensional and objective perspective, completely unbiased.",
    "Xem xong mà thấy có nhiều điều phải suy ngẫm về cuộc sống.": "Watching this leaves me with so many profound thoughts about life.",
    "Cảm ơn các nhà báo đã dũng cảm nói lên tiếng nói của sự thật.": "Thank you to the brave journalists speaking up for the absolute truth.",
    "Biên tập xuất sắc, âm thanh dẫn dắt cảm xúc người xem rất tốt.": "Superb editing, the sound design guides the viewer's emotions perfectly.",
    "Cười bể bụng với mấy quả meme này, duyên dáng quá chừng!": "Laughed so hard at these memes, absolutely hilarious and charming!",
    "Giải trí cuối tuần thế này là đủ rồi, xua tan hết mệt mỏi.": "This is perfect for weekend entertainment, washes away all the exhaustion.",
    "Cách dựng video thông minh và lôi cuốn ghê, xem không rời mắt.": "Brilliant video editing, extremely engaging and impossible to look away.",
    "Diễn xuất đỉnh cao thật sự, biểu cảm gương mặt quá tự nhiên.": "Top-tier acting, the facial expressions are incredibly natural.",
    "Nội dung sáng tạo dã man, xem đi xem lại vẫn thấy hài.": "Crazy creative content, watching this on repeat and it's still hilarious.",
    "Kênh này làm nội dung giải trí sạch, xem rất thoải mái tinh thần.": "This channel produces clean entertainment, very refreshing for the mind.",
    "Một bầu trời nghệ thuật và tiếng cười. Chúc nhóm ngày càng phát triển!": "A perfect blend of artistry and humor. Wishing the team continued growth!",
    "Thiên nhiên hoang dã đẹp một cách kỳ vĩ và choáng ngợp.": "Wild nature is spectacularly majestic and absolutely breathtaking.",
    "Độ phân giải 4K trên màn hình của mình nhìn nét đến từng ngọn cỏ.": "The 4K resolution on my display looks incredibly sharp down to every blade of grass.",
    "Cảm thấy con người thật nhỏ bé trước sự vĩ đại của tự nhiên.": "Makes you feel so small in front of the sheer greatness of nature.",
    "Cảnh quay flycam đỉnh thật, góc nhìn vô cùng rộng lớn.": "Stunning drone cinematography, such an expansive and beautiful perspective.",
    "Video này giúp mình giải tỏa stress cực tốt sau giờ làm việc căng thẳng.": "This video is excellent for stress relief after a long and hectic day.",
    "Ước gì một lần được đặt chân đến vùng đất hoang sơ này.": "I wish I could set foot on this pristine, wild land at least once.",
    "Nhạc nền hòa quyện hoàn hảo với tiếng sóng vỗ và tiếng gió.": "The background score blends flawlessly with the sounds of waves and wind.",
    "Kỹ xảo điện ảnh đỉnh cao, nhìn mượt mà và hoành tráng quá.": "Outstanding cinematic visual effects, looks incredibly smooth and epic.",
    "Góc quay và ánh sáng nghệ thuật dã man, đúng chuẩn cine.": "The camera angles and lighting are extremely artistic, true cinematic standard.",
    "Cốt truyện ngắn nhưng đầy tính nhân văn, xem xong thấy nghẹn ngào.": "A short story but filled with human depth, left me quite emotional.",
    "Một bộ phim ngắn xuất sắc cả về mặt hình ảnh lẫn âm thanh.": "An exceptional short film in both visual execution and soundscapes.",
    "Rất khâm phục tài năng biên kịch và đạo diễn của tác phẩm này.": "Deeply admire the screenwriter and director's talent in this masterpiece.",
    "Màu sắc của phim đẹp quá, nhìn rất có chiều sâu nghệ thuật.": "The color grading of this film is beautiful, adding rich artistic depth.",
    "Thèm bún chả và phở Hà Nội quá! Xem xong chỉ muốn xách balo lên đi ngay.": "Craving Hanoi's Bun Cha and Pho so much! Watching this makes me want to pack my bags and go.",
    "Ẩm thực Hà Nội cổ kính và tinh tế thật sự. Video làm rất có tâm.": "Hanoi's culinary heritage is so ancient and sophisticated. Super high-quality video.",
    "Hà Nội 36 phố phường có những quán ăn gia truyền đỉnh cao lắm.": "The 36 streets of Hanoi have some legendary traditional eateries.",
    "Nhìn tô phở bò nghi ngút khói thèm rớt nước mắt. Nhất định phải thử khi ra Hà Nội.": "Seeing that steaming bowl of beef Pho is mouthwatering. Definitely a must-try in Hanoi.",
    "Unreal Engine 5 đúng là một cuộc cách mạng đồ họa game.": "Unreal Engine 5 is truly a gaming graphics revolution.",
    "Công nghệ Lumen chiếu sáng thời gian thực nhìn đã mắt thật.": "Lumen real-time global illumination technology looks absolutely stunning.",
    "Card RTX gánh cấu hình game này chắc cũng mệt bở hơi tai đấy.": "Running this game's specs will probably make RTX cards sweat quite a bit.",
    "Chi tiết vật liệu Nanite nhìn cận cảnh không thấy một vết răng cưa nào luôn.": "The Nanite material detail close-up is flawless, not a single jagged edge in sight.",
    "Bộ Eurorack Modular chất lừ luôn, phối hợp âm thanh quá nhịp nhàng.": "That Eurorack Modular setup is so slick, the sounds are perfectly synchronized.",
    "Moog Sub 37 cho âm bass sâu lắng dã man, rung cả lồng ngực.": "Moog Sub 37 produces such deep bass frequencies, you can feel it in your chest.",
    "Nhạc analog luôn có một độ ấm áp và mộc mạc đặc trưng.": "Analog music always has a very characteristic warmth and raw texture.",
    "Chill cực kỳ! Setup phòng thu nhìn cũng rất công nghệ và tương lai.": "Extremely chill! The studio setup looks very high-tech and futuristic.",
    "Máy tính lượng tử sẽ giải quyết được những bài toán mà siêu máy tính hiện nay bó tay.": "Quantum computers will solve mathematical problems that today's supercomputers can't handle.",
    "Cơ học lượng tử khó hiểu thật sự, nhưng video này minh họa rất dễ hình dung.": "Quantum mechanics is truly mind-bending, but this video illustrates it so clearly.",
    "Sự chồng chập qubit hoạt động kỳ diệu ghê, đúng là ranh giới giữa khoa học và viễn tưởng.": "Qubit superposition works in such a magical way, right on the border of science and fiction.",
    "Vùng đất Patagonia kỳ vĩ quá, nhìn các sông băng khổng lồ mà nổi da gà.": "Patagonia is so grand, looking at those massive glaciers gives me goosebumps.",
    "Drone bay sát vách núi hiểm trở thật, kỹ năng điều khiển flycam siêu đỉnh.": "The drone flies so close to the steep cliffs, extremely skilled piloting.",
    "Cảnh sắc thiên nhiên hoang sơ không một dấu chân người, tuyệt đẹp.": "Pristine natural landscapes with no human footprint, absolutely magnificent.",
    "Trí tuệ nhân tạo đang xóa nhòa ranh giới giữa khoa học kỹ thuật và nghệ thuật.": "Artificial intelligence is blurring the line between science, technology, and art.",
    "Thuật toán tạo tác phẩm nghệ thuật nhìn rất có chiều sâu nhưng vẫn thiếu một chút hồn người.": "Artwork created by algorithms has real depth, though it still lacks a human touch.",
    "Chủ đề bản quyền tranh vẽ AI đang cực kỳ nóng bỏng hiện nay.": "The topic of AI copyright is incredibly hot right now.",
    "Càng xem càng thấy tương lai loài người sẽ gắn liền chặt chẽ với AI.": "The more I watch, the more I see humanity's future closely linked with AI.",
    "Mấy hung thần xe quá tải này tàn phá đường xá kinh khủng, cần phạt thật nặng.": "These overloaded trucks completely destroy the road infrastructure, they deserve heavy fines.",
    "Lực lượng tuần tra giao thông làm việc nghiêm túc thế này thì người dân yên tâm hơn hẳn.": "The traffic patrol force working diligently like this makes the public feel much safer.",
    "Camera ẩn ghi hình xuất sắc quá, vạch trần được nhiều hành vi vi phạm pháp luật.": "Excellent undercover camera work, exposing many illegal traffic behaviors.",
    "Đọc phần mô tả chi tiết của video mới hiểu hết được sự tâm huyết của tác giả.": "Reading the detailed description reveals the true dedication of the creator.",
    "Mô tả video đầy đủ thông tin hữu ích quá, cảm ơn kênh đã chia sẻ.": "The video description is so informative and useful, thanks for sharing.",
    "Nội dung chuẩn chỉ đúng như những gì viết ở caption luôn.": "The content perfectly matches what is written in the caption.",
    "Thích cách tác giả giải thích chi tiết trong phần description.": "I love how detailed the explanation is in the description section.",
    "Đọc caption thấy có nhiều thông tin nghiên cứu rất chuyên sâu.": "The caption has some incredibly deep research and insights.",
    "Đọc chú thích chi tiết mới thấy tác giả đầu tư kỹ lưỡng như thế nào.": "Reading the notes shows how much meticulous effort the author invested."
  };

  // Check for dynamic title-specific template translations on the fly
  let matchedDynamic = false;
  const lowercaseContent = content.toLowerCase();

  if (translationMap[content]) {
    updatedContent = translationMap[content];
  } else {
    // Determine the video title context if possible (we can search the content for the quoted substring)
    const titleMatch = content.match(/"([^"]+)"/);
    const titleFromCmt = titleMatch ? titleMatch[1] : "";

    if (content.includes("Nội dung về") && content.includes("này hay quá")) {
      updatedContent = `The breakdown of "${titleFromCmt || "this video"}" is absolutely brilliant, learned so much from this!`;
      matchedDynamic = true;
    } else if (content.includes("Đúng là chủ đề mình đang tìm kiếm:")) {
      updatedContent = `I've been looking for a comprehensive video about "${titleFromCmt || "this topic"}" for a long time. This is perfect!`;
      matchedDynamic = true;
    } else if (content.includes("Cảnh quay và thông tin về")) {
      updatedContent = `The visual and explanation quality in this video about "${titleFromCmt || "this topic"}" is top-tier.`;
      matchedDynamic = true;
    } else if (content.includes("Phân tích về") && content.includes("rất sâu sắc")) {
      updatedContent = `So well researched! Your analysis of "${titleFromCmt || "this topic"}" has some incredible depth.`;
      matchedDynamic = true;
    } else if (content.includes("Xem xong video về")) {
      updatedContent = `Watching this video about "${titleFromCmt || "this topic"}" makes me appreciate your hard work even more.`;
      matchedDynamic = true;
    } else if (content.includes("Thích cách tiếp cận vấn đề")) {
      updatedContent = `The editing is seamless and the way you presented "${titleFromCmt || "this topic"}" is extremely engaging.`;
      matchedDynamic = true;
    } else if (content.includes("Mong chờ kênh làm thêm nhiều video cùng chủ đề")) {
      updatedContent = `Such clean presentation and valuable info on "${titleFromCmt || "this topic"}". Highly recommended!`;
      matchedDynamic = true;
    } else if (content.includes("Không uổng công click vào xem")) {
      updatedContent = `This deserves millions of views! Exceptional quality on the topic of "${titleFromCmt || "this topic"}".`;
      matchedDynamic = true;
    } else if (content.includes("Cách trình bày về")) {
      updatedContent = `I love how simply and beautifully you explained "${titleFromCmt || "this topic"}". Subscribed!`;
      matchedDynamic = true;
    } else if (content.includes("Cảm ơn tác giả đã chia sẻ một sản phẩm xuất sắc")) {
      updatedContent = `A masterclass on "${titleFromCmt || "this video"}"! Thanks for sharing this useful content.`;
      matchedDynamic = true;
    } else if (content.includes("Vừa nghe vừa ngẫm nghĩ về")) {
      updatedContent = `Everything in this video about "${titleFromCmt || "this topic"}" is perfectly structured and clear.`;
      matchedDynamic = true;
    } else if (content.includes("Những điểm nhấn trong") && content.includes("thực sự đắt giá")) {
      updatedContent = `A very multi-dimensional perspective on "${titleFromCmt || "this topic"}". Amazing work!`;
      matchedDynamic = true;
    }

    if (!matchedDynamic) {
      // If it contains Vietnamese diacritics but is not in the translation map,
      // we can do a fallback or try to strip accents/convert to general English comment
      const hasViContent = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(content);
      if (hasViContent) {
        // Instead of replacing all custom user-authored comments with a generic sentence, 
        // let's preserve them! This allows user-posted Vietnamese comments to remain fully intact in the UI.
        updatedContent = content; 
      }
    }
  }

  // Handle replies too
  const replies = comment.replies ? comment.replies.map((r: any) => sanitizeAndTranslateComment(r)) : undefined;

  return {
    ...comment,
    authorName: updatedName,
    content: updatedContent,
    ...(replies ? { replies } : {})
  };
}
