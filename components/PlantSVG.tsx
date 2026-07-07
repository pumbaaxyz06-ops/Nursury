"use client";

interface PlantSVGProps {
  type: string; // e.g. "tomato", "chilli", "cabbage"
  size?: number;
}

export default function PlantSVG({ type, size = 80 }: PlantSVGProps) {
  const key = type.toLowerCase();

  if (key.includes("tomato")) {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="48" r="25" fill="#E53935"/>
        <ellipse cx="33" cy="38" rx="10" ry="7" fill="#FF7171" opacity=".4"/>
        <ellipse cx="47" cy="62" rx="15" ry="8" fill="#B71C1C" opacity=".38"/>
        <path d="M40 25 Q34 12 28 10 Q36 18 40 25Z" fill="#43A047"/>
        <path d="M40 25 Q46 12 52 10 Q44 18 40 25Z" fill="#2E7D32"/>
        <path d="M40 25 Q25 19 21 24 Q31 25 40 25Z" fill="#388E3C"/>
        <path d="M40 25 Q55 19 59 24 Q49 25 40 25Z" fill="#43A047"/>
        <circle cx="40" cy="25" r="4" fill="#1B5E20"/>
        <path d="M40 21 Q44 13 48 9" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }

  if (key.includes("chilli") || key.includes("chili")) {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M43 16 C52 23 56 40 53 55 C51 64 47 72 40 73 C33 72 29 64 27 55 C24 40 29 23 38 16Z" fill="#E53935"/>
        <path d="M40 73 Q37 77 36 79 Q40 76 44 78 Q42 75 40 73Z" fill="#C62828"/>
        <path d="M41 16 Q39 7 38 3 Q41 9 44 8 Q42 12 41 16Z" fill="#43A047"/>
        <path d="M41 16 Q50 13 53 10 Q46 14 41 16Z" fill="#2E7D32"/>
        <path d="M40 16 Q31 13 28 10 Q35 14 40 16Z" fill="#388E3C"/>
      </svg>
    );
  }

  if (key.includes("cabbage")) {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="17" cy="53" rx="13" ry="22" fill="#558B2F" transform="rotate(-16 17 53)"/>
        <ellipse cx="63" cy="53" rx="13" ry="22" fill="#558B2F" transform="rotate(16 63 53)"/>
        <ellipse cx="27" cy="47" rx="17" ry="26" fill="#7CB342" transform="rotate(-9 27 47)"/>
        <ellipse cx="53" cy="47" rx="17" ry="26" fill="#7CB342" transform="rotate(9 53 47)"/>
        <circle cx="40" cy="46" r="21" fill="#9CCC65"/>
      </svg>
    );
  }

  // Default generic plant: A premium sprout seedling vector
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Soil Base */}
      <path d="M26 64 C32 66, 48 66, 54 64 C50 67, 30 67, 26 64Z" fill="#8D6E63" opacity="0.6"/>
      {/* Sprout Stem */}
      <path d="M40 64 Q39 38 45 22" stroke="#306D29" strokeWidth="4" strokeLinecap="round"/>
      {/* Left Leaf Sprout */}
      <path d="M40 44 Q20 38 25 24 Q36 28 40 44Z" fill="#4CAF50"/>
      {/* Right Leaf Sprout */}
      <path d="M42 32 Q62 20 58 10 Q47 16 42 32Z" fill="#8BC34A"/>
      {/* Small Sprout Bud */}
      <path d="M45 22 Q47 14 51 12 Q47 18 45 22Z" fill="#306D29"/>
    </svg>
  );
}
