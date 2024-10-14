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
        .from('applications') // Assuming 'applications' is the table
        .select('job_title, company_name, created_at, status') // Select relevant fields
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
    return <div className="text-center mt-12">Loading applications...</div>; // Loading state
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>; // Error state
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">Your Applications</h1>
      
      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <p>You have not applied to any jobs yet.</p>
        ) : (
          <ul className="space-y-4">
            {applications.map((application, index) => (
              <li key={index} className="border p-4 rounded-lg shadow-sm">
                <h2 className="font-bold">{application.job_title} at {application.company_name}</h2>
                <p className="text-gray-600">Applied on: {new Date(application.created_at).toLocaleDateString()}</p>
                <p className={`font-bold mt-2 ${application.status === 'pending' ? 'text-yellow-500' : application.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                  Status: {application.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JobSeekerApplications;
