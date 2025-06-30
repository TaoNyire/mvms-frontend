// components/StatCard.js
export default function StatCard({ label, value, color = "indigo" }) {
  return (
    <div className={`p-4 rounded-lg shadow-md bg-${color}-100`}>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</h3>
      <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}