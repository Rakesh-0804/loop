type Props = {
  status: "Reviewed" | "Pending" | "Flagged";
};

export default function StatusBadge({ status }: Props) {
  const styles = {
    Reviewed: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Flagged: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}