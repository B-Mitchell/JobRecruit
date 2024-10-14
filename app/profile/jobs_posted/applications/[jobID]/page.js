'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs'; // For authentication

const JobApplicationsPage = ({ params }) => {
  const { user } = useUser();
  const router = useRouter();
  const jobID = params.jobID;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch job applications
  const fetchJobApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobID); // Fetch applications for this specific job ID

      if (error) throw error;
      setApplications(data);
      console.log(data);
    } catch (err) {
      setError('Error fetching job applications');
    } finally {
      setLoading(false);
    }
  };

  // Function to update the status of an application
  const updateApplicationStatus = async (applicationID, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus }) // Update the status in the database
        .eq('id', applicationID); // Update only the specific application

      if (error) throw error;
      // Refetch applications after updating
      fetchJobApplications();
    } catch (err) {
      console.error('Error updating application status:', err.message);
    }
  };

  // Ensure only employers can access the page
  const checkIfEmployer = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', user.id)
      .single();

    if (error || data.role !== 'employer') {
      router.push('/'); // Redirect if not an employer
    }
  };

  useEffect(() => {
    if (user) {
      checkIfEmployer();
      fetchJobApplications();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <p className='text-xl text-gray-700'>Loading applications...</p>
      </div>
    ); // Loading state
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>; // Error state
  }

  return (
    <div className="max-w-5xl mx-auto my-10 px-8 pb-8 bg-white shadow-md rounded-lg">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6 rounded-md text-white mb-8">
        <h1 className="text-3xl font-semibold">Job Applications Overview</h1>
        <p className="text-lg">Here are the applications for the job:</p>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-600">No applications found for this job.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {applications.map((application) => (
              <li key={application.id} className="border p-6 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-xl">{application.job_title}</h2>
                    <h3 className="font-semibold text-lg">{application.name}</h3>
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

                {/* Status Update Buttons */}
                {application.status === 'pending' && (
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'approved')}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-500 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JobApplicationsPage;
