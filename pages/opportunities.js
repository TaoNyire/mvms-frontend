import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import {
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function PublicOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real opportunities from database
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError('');

        console.log('Fetching opportunities from:', `${API_BASE}/opportunities/public`);
        const response = await axios.get(`${API_BASE}/opportunities/public`);
        const opportunitiesData = response.data?.data || response.data || [];

        console.log('Fetched opportunities:', opportunitiesData);
        setOpportunities(opportunitiesData);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        // Provide sample data for demonstration
        console.log('Using sample data due to API error');
        const sampleOpportunities = [
          {
            id: 1,
            title: "Community Garden Project",
            description: "Help establish and maintain a community garden to provide fresh produce for local families in need. This is a hands-on opportunity to make a real difference in food security.",
            location: "Downtown Community Center",
            start_date: "2024-02-01",
            end_date: "2024-04-30",
            volunteers_needed: 8,
            category: "Environment",
            skills: ["Gardening", "Community Outreach"],
            organization: {
              name: "Green Future Initiative"
            }
          },
          {
            id: 2,
            title: "Youth Education Support",
            description: "Assist with after-school tutoring and mentoring programs for underprivileged children. Help with homework, reading, and basic computer skills.",
            location: "Lilongwe Primary School",
            start_date: "2024-01-15",
            end_date: "2024-06-15",
            volunteers_needed: 12,
            category: "Education",
            skills: ["Teaching", "Mentoring", "Patience"],
            organization: {
              name: "Education for All Malawi"
            }
          },
          {
            id: 3,
            title: "Healthcare Outreach Program",
            description: "Support mobile health clinics in rural areas. Assist with patient registration, basic health education, and community health awareness campaigns.",
            location: "Rural Blantyre District",
            start_date: "2024-03-01",
            end_date: "2024-05-31",
            volunteers_needed: 6,
            category: "Healthcare",
            skills: ["Healthcare", "Communication", "Community Service"],
            organization: {
              name: "Malawi Health Partners"
            }
          }
        ];

        setOpportunities(sampleOpportunities);

        // Set a more user-friendly error message
        if (error.response?.status === 401) {
          setError('Using sample data for demonstration - API authentication required');
        } else if (error.response?.status === 500) {
          setError('Using sample data for demonstration - server temporarily unavailable');
        } else if (!error.response) {
          setError('Using sample data for demonstration - network connection issue');
        } else {
          setError('Using sample data for demonstration - API temporarily unavailable');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Helper function to determine category from opportunity data
  const determineCategory = (opportunity) => {
    const title = opportunity.title?.toLowerCase() || '';
    const description = opportunity.description?.toLowerCase() || '';

    if (title.includes('environment') || title.includes('garden') || title.includes('clean') ||
        description.includes('environment') || description.includes('garden') || description.includes('clean')) {
      return 'Environmental';
    } else if (title.includes('education') || title.includes('school') || title.includes('teach') ||
               description.includes('education') || description.includes('teach') || description.includes('tutor')) {
      return 'Education';
    } else if (title.includes('health') || title.includes('medical') || title.includes('clinic') ||
               description.includes('health') || description.includes('medical') || description.includes('clinic')) {
      return 'Healthcare';
    } else if (title.includes('tech') || title.includes('digital') || title.includes('computer') ||
               description.includes('tech') || description.includes('digital') || description.includes('computer')) {
      return 'Technology';
    } else {
      return 'Social';
    }
  };

  // Add category to each opportunity
  const opportunitiesWithCategories = opportunities.map(opp => ({
    ...opp,
    category: determineCategory(opp)
  }));

  // Get unique categories from actual data
  const categoriesFromData = [...new Set(opportunitiesWithCategories.map(opp => opp.category))];
  const categories = ['all', ...categoriesFromData];

  const filteredOpportunities = opportunitiesWithCategories.filter(opp => {
    const matchesSearch = opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      Environmental: 'bg-green-100 text-green-800',
      Education: 'bg-blue-100 text-blue-800',
      Healthcare: 'bg-red-100 text-red-800',
      Technology: 'bg-purple-100 text-purple-800',
      Social: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Environmental': return '🌱';
      case 'Education': return '📚';
      case 'Healthcare': return '🏥';
      case 'Technology': return '💻';
      case 'Social': return '🤝';
      default: return '📋';
    }
  };

  return (
    <>
      <Head>
        <title>Volunteer Opportunities - MVMS</title>
        <meta name="description" content="Discover meaningful volunteer opportunities in your community" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <HeartIcon className="w-8 h-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">MVMS</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">
                  Home
                </Link>
                <Link href="/login" className="text-gray-600 hover:text-green-600 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Volunteer Opportunities
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Find meaningful ways to contribute to your community and make a lasting impact
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading opportunities...</div>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {opportunities.length === 0
                  ? "No opportunities available at the moment."
                  : "No opportunities found matching your criteria."}
              </div>
              <p className="text-gray-400 mt-2">
                {opportunities.length === 0
                  ? "Check back soon for new volunteer opportunities!"
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {filteredOpportunities.length} of {opportunities.length} opportunities
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <div className="text-white text-4xl">
                        {getCategoryIcon(opportunity.category)}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(opportunity.category)}`}>
                          {opportunity.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {opportunity.volunteers_needed || 'Multiple'} volunteers needed
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {opportunity.title}
                      </h3>

                      <p className="text-gray-600 mb-3">{opportunity.organization?.name || 'Organization'}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4 mr-2" />
                          {opportunity.location || 'Location TBD'}
                        </div>
                        {opportunity.start_date && (
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {new Date(opportunity.start_date).toLocaleDateString()}
                            {opportunity.end_date && ` - ${new Date(opportunity.end_date).toLocaleDateString()}`}
                          </div>
                        )}
                        {opportunity.time_commitment && (
                          <div className="flex items-center text-sm text-gray-600">
                            <UserGroupIcon className="w-4 h-4 mr-2" />
                            {opportunity.time_commitment}
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {opportunity.description || 'Join this meaningful volunteer opportunity and make a difference in your community.'}
                      </p>

                      {/* Skills Required */}
                      {opportunity.skills_required && Array.isArray(opportunity.skills_required) && opportunity.skills_required.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Skills Required:</p>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.skills_required.slice(0, 3).map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                            {opportunity.skills_required.length > 3 && (
                              <span className="text-xs text-gray-500">+{opportunity.skills_required.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium inline-flex items-center">
                          Apply Now
                          <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </Link>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join our community of volunteers and start making a difference today.
            </p>
            <Link href="/register" className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Create Your Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
