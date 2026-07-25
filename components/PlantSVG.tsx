"use client";

interface PlantSVGProps {
  type: string; // e.g. "tomato", "chilli", "cabbage"
  emoji?: string;
  size?: number;
}

export default function PlantSVG({ type, emoji, size = 80 }: PlantSVGProps) {
  const key = (type || "").toLowerCase();

  // Prefer matching by English name keywords, then emoji fallback visuals
  if (key.includes("tomato") || emoji === "🍅") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="48" r="25" fill="#E53935" />
        <ellipse cx="33" cy="38" rx="10" ry="7" fill="#FF7171" opacity=".4" />
        <ellipse cx="47" cy="62" rx="15" ry="8" fill="#B71C1C" opacity=".38" />
        <path d="M40 25 Q34 12 28 10 Q36 18 40 25Z" fill="#43A047" />
        <path d="M40 25 Q46 12 52 10 Q44 18 40 25Z" fill="#2E7D32" />
        <path d="M40 25 Q25 19 21 24 Q31 25 40 25Z" fill="#388E3C" />
        <path d="M40 25 Q55 19 59 24 Q49 25 40 25Z" fill="#43A047" />
        <circle cx="40" cy="25" r="4" fill="#1B5E20" />
        <path d="M40 21 Q44 13 48 9" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes("chilli") || key.includes("chili") || key.includes("pepper") || emoji === "🌶️") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M43 16 C52 23 56 40 53 55 C51 64 47 72 40 73 C33 72 29 64 27 55 C24 40 29 23 38 16Z" fill="#E53935" />
        <path d="M40 73 Q37 77 36 79 Q40 76 44 78 Q42 75 40 73Z" fill="#C62828" />
        <path d="M41 16 Q39 7 38 3 Q41 9 44 8 Q42 12 41 16Z" fill="#43A047" />
        <path d="M41 16 Q50 13 53 10 Q46 14 41 16Z" fill="#2E7D32" />
        <path d="M40 16 Q31 13 28 10 Q35 14 40 16Z" fill="#388E3C" />
      </svg>
    );
  }

  if (key.includes("cabbage") || key.includes("cauli") || emoji === "🥬") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="17" cy="53" rx="13" ry="22" fill="#558B2F" transform="rotate(-16 17 53)" />
        <ellipse cx="63" cy="53" rx="13" ry="22" fill="#558B2F" transform="rotate(16 63 53)" />
        <ellipse cx="27" cy="47" rx="17" ry="26" fill="#7CB342" transform="rotate(-9 27 47)" />
        <ellipse cx="53" cy="47" rx="17" ry="26" fill="#7CB342" transform="rotate(9 53 47)" />
        <circle cx="40" cy="46" r="21" fill="#9CCC65" />
        <ellipse cx="40" cy="46" rx="12" ry="14" fill="#C5E1A5" opacity="0.7" />
      </svg>
    );
  }

  if (key.includes("brinjal") || key.includes("eggplant") || key.includes("aubergine") || emoji === "🍆") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="48" rx="18" ry="24" fill="#6A1B9A" />
        <ellipse cx="34" cy="40" rx="6" ry="10" fill="#AB47BC" opacity="0.45" />
        <path d="M40 26 Q32 18 28 16 Q36 22 40 26Z" fill="#43A047" />
        <path d="M40 26 Q48 18 52 16 Q44 22 40 26Z" fill="#2E7D32" />
        <path d="M40 26 Q40 14 42 10" stroke="#1B5E20" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="40" cy="68" rx="8" ry="4" fill="#4A148C" opacity="0.5" />
      </svg>
    );
  }

  if (key.includes("marigold") || key.includes("flower") || emoji === "🌼" || emoji === "🌻") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse
            key={deg}
            cx="40"
            cy="40"
            rx="10"
            ry="18"
            fill="#FFB300"
            transform={`rotate(${deg} 40 40)`}
          />
        ))}
        <circle cx="40" cy="40" r="10" fill="#F57F17" />
        <circle cx="40" cy="40" r="5" fill="#FF8F00" />
        <path d="M40 58 L40 72" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 64 Q32 60 28 62" stroke="#43A047" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (key.includes("rose") || emoji === "🌹") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="36" r="18" fill="#C62828" />
        <path d="M40 22 C48 22 54 28 54 36 C54 28 48 24 40 28 C32 24 26 28 26 36 C26 28 32 22 40 22Z" fill="#E53935" />
        <path d="M40 28 C46 28 50 32 50 36 C50 32 46 30 40 32 C34 30 30 32 30 36 C30 32 34 28 40 28Z" fill="#FF5252" />
        <circle cx="40" cy="36" r="5" fill="#B71C1C" />
        <path d="M40 52 L40 70" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 58 Q30 54 26 58 Q34 58 40 62" fill="#43A047" />
        <path d="M40 62 Q50 56 54 60 Q46 60 40 66" fill="#388E3C" />
      </svg>
    );
  }

  if (key.includes("mango") || emoji === "🥭") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="42" cy="46" rx="20" ry="24" fill="#FFB300" transform="rotate(-15 42 46)" />
        <ellipse cx="36" cy="40" rx="8" ry="12" fill="#FFD54F" opacity="0.5" transform="rotate(-15 36 40)" />
        <path d="M36 24 Q32 14 28 12 Q34 18 38 24" fill="#43A047" />
        <path d="M38 24 Q46 16 50 14 Q44 20 40 26" fill="#2E7D32" />
      </svg>
    );
  }

  if (key.includes("onion") || emoji === "🧅") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="48" rx="22" ry="20" fill="#CE93D8" />
        <ellipse cx="40" cy="48" rx="16" ry="14" fill="#E1BEE7" opacity="0.6" />
        <path d="M40 28 L36 12 L40 16 L44 12 Z" fill="#81C784" />
        <path d="M40 28 L32 14" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 28 L48 14" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes("potato") || emoji === "🥔") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="42" rx="26" ry="20" fill="#A1887F" transform="rotate(-8 40 42)" />
        <circle cx="30" cy="38" r="2.5" fill="#6D4C41" />
        <circle cx="48" cy="44" r="2" fill="#6D4C41" />
        <circle cx="38" cy="50" r="2" fill="#6D4C41" />
        <circle cx="50" cy="34" r="1.5" fill="#6D4C41" />
      </svg>
    );
  }

  if (key.includes("okra") || key.includes("bhindi") || emoji === "🥬") {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 14 C48 28 52 48 48 68 C46 74 42 76 40 76 C38 76 34 74 32 68 C28 48 32 28 40 14Z" fill="#66BB6A" />
        <path d="M40 20 L40 70" stroke="#2E7D32" strokeWidth="1.5" opacity="0.5" />
        <path d="M40 14 Q36 10 34 8" stroke="#43A047" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // If custom emoji provided and no match, show emoji in a soft circle
  if (emoji && emoji !== "🌱") {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.55 }}
        className="flex items-center justify-center rounded-full bg-primary-light/60"
      >
        {emoji}
      </div>
    );
  }

  // Default premium seedling
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 64 C32 66, 48 66, 54 64 C50 67, 30 67, 26 64Z" fill="#8D6E63" opacity="0.6" />
      <path d="M40 64 Q39 38 45 22" stroke="#306D29" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 44 Q20 38 25 24 Q36 28 40 44Z" fill="#4CAF50" />
      <path d="M42 32 Q62 20 58 10 Q47 16 42 32Z" fill="#8BC34A" />
      <path d="M45 22 Q47 14 51 12 Q47 18 45 22Z" fill="#306D29" />
    </svg>
  );
}
