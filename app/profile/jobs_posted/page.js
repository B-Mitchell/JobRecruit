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
    <div className="max-w-5xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">Your Job Postings</h1>

      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li 
              key={job.id} 
              className="border p-4 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
            >
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-600">{job.description}</p>
              <p className="font-medium">Salary: {job.salary}</p>
              <p className="font-medium">Location: {job.location}</p>
              <p className="font-medium">Job Type: {job.job_type}</p>
              <p className="font-medium">Category: {job.category}</p>
              <p className="font-medium">Posted On: {new Date(job.created_at).toLocaleDateString()}</p>
              
              {/* Centered Button */}
              <div className="flex justify-end mt-4">
                <button className='bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors mr-5' onClick={() => router.push(`/profile/jobs_posted/${job.job_id}`)}>
                  See Applicants
                </button>
                <button className='bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors' onClick={() => router.push(`/profile/jobs_posted/applications/${job.job_id}`)}>
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
