import { useRouter } from "next/router";

export default function RecentFeedback({ feedback }) {
  const router = useRouter();
export function RecentFeedback({ feedback }) {
  if (!feedback || feedback.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold text-black mb-4">Recent Feedback</h2>
      <div className="space-y-3">
        {feedback.map((item) => (
          <div key={item.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
            <div className="flex justify-between">
              <h3 className="font-medium">{item.opportunity_title}</h3>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.feedback.comments}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.feedback.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      <button 
        onClick={() => router.push('/my-feedback')}
        className="mt-3 text-sm text-indigo-600 hover:underline"
      >
        View all feedback
      </button>
    </div>
  );
}}