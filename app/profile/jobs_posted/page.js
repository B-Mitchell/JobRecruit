'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const EmployerJobsPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployerJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', user.id); // Assuming `posted_by` links to the job poster

      if (error) throw error;
      setJobs(data);
    } catch (err) {
      setError('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployerJobs();
    }
  }, []);

  if (loading) {
    return <div className="text-center mt-12">Loading your job postings...</div>;
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-10 px-8 pb-8 bg-white shadow-lg rounded-lg">
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6 rounded-md text-white mb-8">
        <h1 className="text-3xl font-semibold">Your Job Postings</h1>
      </div>

      {jobs.length === 0 ? (
        <p className="text-center text-gray-600">You haven not posted any jobs yet.</p>
      ) : (
        <ul className="space-y-6">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="border border-gray-300 p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{job.title}</h2>
                  <p className="text-gray-600 mt-2">{job.description}</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium text-gray-700">Salary: {job.salary}</p>
                    <p className="text-sm font-medium text-gray-700">Location: {job.location}</p>
                    <p className="text-sm font-medium text-gray-700">Job Type: {job.job_type}</p>
                    <p className="text-sm font-medium text-gray-700">Category: {job.category}</p>
                    <p className="text-sm text-gray-500">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Buttons Section */}
              <div className="flex justify-end items-center space-x-4 mt-6">
                <button
                  className="py-2 px-5 rounded-md bg-gradient-to-r from-blue-600 to-teal-600 text-white transition-colors"
                  onClick={() => router.push(`/profile/jobs_posted/${job.job_id}`)}
                >
                  See Applicants
                </button>
                <button
                  className="py-2 px-5 rounded-md bg-gradient-to-r from-green-600 to-blue-600 text-white transition-colors"
                  onClick={() => router.push(`/profile/jobs_posted/applications/${job.job_id}`)}
                >
                  View Applications
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployerJobsPage;
