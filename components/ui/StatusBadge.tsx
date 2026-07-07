"use client";

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  ready_to_dispatch: "bg-blue-100 text-blue-800 border border-blue-200",
  fulfilled: "bg-green-100 text-green-800 border border-green-200",
  cancelled: "bg-red-100 text-red-700 border border-red-200",
  healthy: "bg-green-100 text-green-800 border border-green-200",
  average: "bg-orange-100 text-orange-800 border border-orange-200",
  poor: "bg-red-100 text-red-700 border border-red-200",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.replace(/_/g, " ");
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${statusColors[status] || "bg-gray-100"}`}>
      {label}
    </span>
  );
}
