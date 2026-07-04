export const CATEGORIES_LIST = [
  "Film & Cinema",
  "Music",
  "Tech",
  "Gaming",
  "Education",
  "News & Documentary",
  "Entertainment",
  "Nature"
];

export const CATEGORY_MAP: Record<string, string> = {
  "Phim ảnh": "Film & Cinema",
  "Âm nhạc": "Music",
  "Công nghệ": "Tech",
  "Trò chơi": "Gaming",
  "Giáo dục": "Education",
  "Tin tức & Phóng sự": "News & Documentary",
  "Giải trí": "Entertainment",
  "Thiên nhiên": "Nature"
};

export function normalizeCategory(cat: string): string {
  if (!cat) return "Film & Cinema";
  return CATEGORY_MAP[cat] || cat;
}
