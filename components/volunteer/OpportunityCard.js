export function OpportunityCard({ opp, matchedSkills, onViewDetails, applicationStatus }) {
  const skillsRequired = Array.isArray(opp.skills_required) ? opp.skills_required : [];
  
  // Calculate match percentage
  const matchPercentage = matchedSkills.length > 0 
    ? Math.round((matchedSkills.length / skillsRequired.length) * 100)
    : 0;

  return (
    <article className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-gray-900">{opp.title}</h2>
        {applicationStatus && (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            applicationStatus === 'accepted' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {applicationStatus}
          </span>
        )}
      </div>
      
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        {opp.location}
      </div>
      
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        {new Date(opp.start_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })}
        {opp.end_date && (
          <>
            <span className="mx-1">to</span>
            {new Date(opp.end_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </>
        )}
      </div>
      
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{opp.description}</p>
      
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-500">Skill match</span>
          <span className="text-xs font-semibold">{matchPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full" 
            style={{ width: `${matchPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-3">
        <span className="text-xs font-medium text-gray-500">Skills required:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {skillsRequired.map((skill, i) => {
            const isMatched = matchedSkills.some(
              (ms) => ms.toLowerCase() === skill.toLowerCase()
            );
            return (
              <span
                key={i}
                className={`px-2 py-1 rounded-full text-xs ${
                  isMatched ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {skill}
              </span>
            );
          })}
        </div>
      </div>
      
      <button
        onClick={() => onViewDetails(opp.id)}
        className={`mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          applicationStatus 
            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500"
            : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
        }`}
      >
        {applicationStatus ? 'View Application' : 'View Details & Apply'}
      </button>
    </article>
  );
}