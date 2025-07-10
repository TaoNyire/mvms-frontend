import { useRouter } from "next/router";

export function QuickActions() {
  const router = useRouter();
  
  const actions = [
    {
      title: "Update Profile",
      icon: "👤",
      action: () => router.push('/volunteer/profile'),
      color: "indigo"
    },
    {
      title: "View Applications",
      icon: "📋",
      action: () => router.push('/my-applications'),
      color: "green"
    },
    {
      title: "Provide Feedback",
      icon: "💬",
      action: () => router.push('/my-feedback'),
      color: "purple"
    },
    {
      title: "Browse Opportunities",
      icon: "🔍",
      action: () => router.push('/opportunities'),
      color: "blue"
    }
  ];

  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-200"
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold text-black mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`p-3 rounded-lg flex flex-col items-center justify-center ${colorClasses[action.color]}`}
          >
            <span className="text-2xl mb-1">{action.icon}</span>
            <span className="text-sm font-medium">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}