export function VolunteerStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Applications" 
        value={stats.totalApplications} 
        icon="📝"
        color="indigo"
      />
      <StatCard 
        title="Active Opportunities" 
        value={stats.activeOpportunities} 
        icon="✅"
        color="green"
      />
      <StatCard 
        title="Hours Volunteered" 
        value={stats.hoursVolunteered} 
        icon="⏱️"
        color="blue"
      />
      <StatCard 
        title="Completed Tasks" 
        value={stats.completedTasks} 
        icon="🏆"
        color="purple"
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800"
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}