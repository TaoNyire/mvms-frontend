// components/ApplicationCard.js
export default function ApplicationCard({ app }) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Accepted: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800">{app.title}</h3>
        <span className={`px-2 py-1 text-xs rounded ${statusStyles[app.status]}`}>
          {app.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-2">{app.organization}</p>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">Applied on {app.dateApplied}</span>
        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}