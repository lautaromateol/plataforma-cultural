// Color palettes for subjects
export const colorPalettes = [
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  { bg: "from-blue-500 to-cyan-600", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  { bg: "from-fuchsia-500 to-pink-600", light: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-200" },
];

export function getColorBySubjectId(subjectId: string): typeof colorPalettes[0] {
  const colorIndex = subjectId ? subjectId.charCodeAt(0) % colorPalettes.length : 0;
  return colorPalettes[colorIndex];
}
