'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase'; // Your Supabase instance
import { useUser } from '@clerk/nextjs'; // Clerk for authentication
import { useRouter } from 'next/navigation';

const JobSeekerApplications = () => {
  const { user } = useUser(); // Get the current logged-in user
  const [applications, setApplications] = useState([]); // State to store applications
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications') 
        .select('job_title, company_name, created_at, status')
        .eq('user_id', user.id); // Filter by current user's ID (job seeker)

      if (error) {
        throw error; // Handle errors
      }

      setApplications(data); // Store application data
    } catch (err) {
      console.error('Error fetching applications:', err.message);
      setError('Error fetching applications');
    } finally {
      setLoading(false); // Stop loading once data is fetched
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications(); // Fetch applications when the user is available
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className='text-xl text-gray-700'>Loading applications...</p>
      </div>
    ); // Loading state
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>; // Error state
  }

  return (
    <div className="max-w-5xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      
      {/* Profile section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6 rounded-md text-white mb-8">
        <h1 className="text-3xl font-semibold">Welcome, {user?.fullName}</h1>
        <p className="text-lg">Here are your current job applications:</p>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-600">You have not applied to any jobs yet.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {applications.map((application, index) => (
              <li
                key={index}
                className="border p-6 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-xl">{application.job_title}</h2>
                    <p className="text-gray-500">{application.company_name}</p>
                    <p className="text-gray-400">
                      Applied on: {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Application Status */}
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        application.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-500'
                          : application.status === 'approved'
                          ? 'bg-green-100 text-green-500'
                          : 'bg-red-100 text-red-500'
                      }`}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JobSeekerApplications;
