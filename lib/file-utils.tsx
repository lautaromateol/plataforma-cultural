import { FileText, FileImage, FileVideo, FileMusic, FileArchive, File } from "lucide-react";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function getFileIcon(fileType: string) {
  if (fileType.includes("pdf")) return <FileText className="w-6 h-6" />;
  if (fileType.includes("image")) return <FileImage className="w-6 h-6" />;
  if (fileType.includes("video")) return <FileVideo className="w-6 h-6" />;
  if (fileType.includes("audio")) return <FileMusic className="w-6 h-6" />;
  if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="w-6 h-6" />;
  return <File className="w-6 h-6" />;
}

export function getFileColor(fileType: string): string {
  if (fileType.includes("pdf")) return "from-red-500 to-rose-600";
  if (fileType.includes("image")) return "from-emerald-500 to-teal-600";
  if (fileType.includes("video")) return "from-violet-500 to-purple-600";
  if (fileType.includes("audio")) return "from-amber-500 to-orange-600";
  if (fileType.includes("word") || fileType.includes("document")) return "from-blue-500 to-cyan-600";
  if (fileType.includes("sheet") || fileType.includes("excel")) return "from-green-500 to-emerald-600";
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "from-orange-500 to-red-600";
  if (fileType.includes("zip") || fileType.includes("rar")) return "from-slate-500 to-gray-600";
  return "from-slate-400 to-gray-500";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
