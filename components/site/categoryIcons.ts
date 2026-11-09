import { Flame, Swords, Target, Wind, type LucideIcon } from "lucide-react";
import type { CategoryId } from "@/lib/products";

export const categoryIcons: Record<CategoryId, LucideIcon> = {
  kickboxing: Flame,
  boxing: Target,
  kungfu: Wind,
  mma: Swords,
};
