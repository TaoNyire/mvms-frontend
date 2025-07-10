'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import axios from 'axios';
import {
  HeartIcon,
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function Home() {
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({
    volunteers: 0,
    organizations: 0,
    totalOpportunities: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured opportunities (public endpoint)
        const opportunitiesRes = await axios.get(`${API_BASE}/opportunities/public`);
        const opportunitiesData = opportunitiesRes.data?.data || opportunitiesRes.data || [];

        // Take only first 3 for featured section
        setOpportunities(opportunitiesData.slice(0, 3));

        // Fetch statistics
        const statsRes = await axios.get(`${API_BASE}/stats/public`);
        if (statsRes.data) {
          setStats({
            volunteers: statsRes.data.volunteers || 0,
            organizations: statsRes.data.organizations || 0,
            totalOpportunities: statsRes.data.opportunities || opportunitiesData.length
          });
        } else {
          // Fallback: calculate from available data
          setStats({
            volunteers: 500, // Default fallback
            organizations: 150, // Default fallback
            totalOpportunities: opportunitiesData.length
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });

        // Set fallback data on error
        setStats({
          volunteers: 500,
          organizations: 150,
          totalOpportunities: 3
        });

        // Set empty data - no sample data
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>MVMS - Malawi Volunteer Management System</title>
        <meta name="description" content="Connect with meaningful volunteer opportunities and make a difference in your community" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <HeartIcon className="w-8 h-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">MVMS</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/opportunities" className="text-gray-600 hover:text-green-600 transition-colors">
                  Opportunities
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

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Make a <span className="text-green-600">Difference</span> Through
                <br />
                <span className="text-blue-600">Volunteering</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Connect with meaningful volunteer opportunities, track your impact, and join a community
                of changemakers working to build a better world.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Start Volunteering
                </Link>
                <Link href="#opportunities" className="bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  View Opportunities
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {loading ? '...' : `${stats.volunteers}+`}
                  </div>
                  <div className="text-gray-600">Active Volunteers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {loading ? '...' : `${stats.organizations}+`}
                  </div>
                  <div className="text-gray-600">Organizations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {loading ? '...' : `${stats.totalOpportunities}+`}
                  </div>
                  <div className="text-gray-600">Opportunities</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Choose MVMS?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform makes it easy to find, apply for, and manage volunteer opportunities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                <UserGroupIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Match</h3>
                <p className="text-gray-600">
                  Get personalized recommendations based on your skills and interests
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                <GlobeAltIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Impact</h3>
                <p className="text-gray-600">
                  Monitor your volunteer hours and see the difference you're making
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                <SparklesIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Community</h3>
                <p className="text-gray-600">
                  Connect with like-minded volunteers and organizations
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Opportunities Section */}
        <section id="opportunities" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Featured Opportunities
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover meaningful ways to contribute to your community
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading opportunities...</div>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No opportunities available at the moment.</div>
                <p className="text-gray-400 mt-2">Check back soon for new volunteer opportunities!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {opportunities.map((opportunity) => {
                  // Determine category icon based on opportunity data
                  const getCategoryIcon = (opp) => {
                    const title = opp.title?.toLowerCase() || '';
                    const description = opp.description?.toLowerCase() || '';

                    if (title.includes('environment') || title.includes('garden') || title.includes('clean') ||
                        description.includes('environment') || description.includes('garden')) {
                      return '🌱';
                    } else if (title.includes('education') || title.includes('school') || title.includes('teach') ||
                               description.includes('education') || description.includes('teach')) {
                      return '📚';
                    } else if (title.includes('health') || title.includes('medical') || title.includes('clinic') ||
                               description.includes('health') || description.includes('medical')) {
                      return '🏥';
                    } else if (title.includes('tech') || title.includes('digital') || title.includes('computer') ||
                               description.includes('tech') || description.includes('digital')) {
                      return '💻';
                    } else {
                      return '🤝';
                    }
                  };

                  const getCategoryName = (opp) => {
                    const title = opp.title?.toLowerCase() || '';
                    const description = opp.description?.toLowerCase() || '';

                    if (title.includes('environment') || title.includes('garden') || title.includes('clean') ||
                        description.includes('environment') || description.includes('garden')) {
                      return 'Environmental';
                    } else if (title.includes('education') || title.includes('school') || title.includes('teach') ||
                               description.includes('education') || description.includes('teach')) {
                      return 'Education';
                    } else if (title.includes('health') || title.includes('medical') || title.includes('clinic') ||
                               description.includes('health') || description.includes('medical')) {
                      return 'Healthcare';
                    } else if (title.includes('tech') || title.includes('digital') || title.includes('computer') ||
                               description.includes('tech') || description.includes('digital')) {
                      return 'Technology';
                    } else {
                      return 'Community';
                    }
                  };

                  return (
                    <div key={opportunity.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <div className="text-white text-6xl">
                          {getCategoryIcon(opportunity)}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            {getCategoryName(opportunity)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {opportunity.volunteers_needed || 'Multiple'} volunteers needed
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {opportunity.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{opportunity.organization?.name || 'Organization'}</p>
                        <p className="text-sm text-gray-500 mb-4">📍 {opportunity.location || 'Location TBD'}</p>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                          {opportunity.description || 'Join this meaningful volunteer opportunity.'}
                        </p>
                        <Link href="/register" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
                          Learn More
                          <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="text-center">
              <Link href="/opportunities" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center">
                View All Opportunities
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Getting started is simple and takes just a few minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up</h3>
                <p className="text-gray-600">Create your account and complete your profile</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse</h3>
                <p className="text-gray-600">Explore opportunities that match your interests</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply</h3>
                <p className="text-gray-600">Submit your application with just a few clicks</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Volunteer</h3>
                <p className="text-gray-600">Start making a difference in your community</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                What Our Volunteers Say
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Hear from community members who are making a difference
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">TN</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Tao Nyirenda</h4>
                    <p className="text-sm text-gray-600">Environmental Volunteer</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "tizayika ma comments in the future "
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">JN</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">James Nthambazarie</h4>
                    <p className="text-sm text-gray-600">Software Developer</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "tizayika ma comments in the future "
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">YN</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Yombo Nyirenda</h4>
                    <p className="text-sm text-gray-600">Healthcare Volunteer</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "tizayika ma comments in the future "
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of volunteers who are already creating positive change in their communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
                Get Started Today
              </Link>
              <Link href="/opportunities" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-green-600 transition-colors">
                Browse Opportunities
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <HeartIcon className="w-8 h-8 text-green-400" />
                  <span className="text-2xl font-bold">MVMS</span>
                </div>
                <p className="text-gray-400 mb-4 max-w-md">
                  Malawi Volunteer Management System - Connecting volunteers with meaningful opportunities to create positive change in communities.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/opportunities" className="text-gray-400 hover:text-white transition-colors">Browse Opportunities</Link></li>
                  <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Join as Volunteer</Link></li>
                  <li><Link href="/organization/register" className="text-gray-400 hover:text-white transition-colors">Register Organization</Link></li>
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>📧 mzuzu ict dept</li>
                  <li>📞 +265 996 630 499</li>
                  <li>📍 Mzuzu University</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                &copy; 2025 MVMS - Malawi Volunteer Management System. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}