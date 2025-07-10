export function UpcomingShifts({ shifts }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold text-black mb-4">Upcoming Shifts</h2>
      
      {shifts.length > 0 ? (
        <ul className="space-y-3">
          {shifts.map(shift => (
            <li key={shift.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{shift.opportunity_title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(shift.start_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{shift.location}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  shift.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  shift.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {shift.status}
                </span>
              </div>
              <button 
                onClick={() => router.push(`/applications/${shift.application_id}/task-status`)}
                className="mt-2 text-sm text-indigo-600 hover:underline"
              >
                View details
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">No upcoming shifts scheduled</p>
          <button 
            onClick={() => router.push('/opportunities')}
            className="mt-2 text-sm text-indigo-600 hover:underline"
          >
            Browse opportunities
          </button>
        </div>
      )}
    </div>
  );
}