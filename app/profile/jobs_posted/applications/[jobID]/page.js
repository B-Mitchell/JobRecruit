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
      console.log(data)
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
    return <div className="text-center mt-12">Loading applications...</div>;
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">Job Applications for {applications.map(app => app.job_title)}</h1>

      {applications.length === 0 ? (
        <p>No applications found for this job.</p>
      ) : (
        <ul className="space-y-4">
          {applications.map((application) => (
            <li key={application.id} className="border p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold">{application.job_title}</h2>
              <h2 className="text-lg font-semibold">{application.name}</h2>
              <p className="text-gray-600">Email: {application.email}</p>
              <p className={`font-medium ${application.status === 'approved' && 'text-green-500'} ${application.status === 'rejected' && 'text-red-500'}`}>Status: {application.status}</p>

              {/* Status Update Buttons */}
              {
                application.status === 'pending' && <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => updateApplicationStatus(application.id, 'approved')}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-500 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-500 transition-colors"
                >
                  Reject
                </button>
              </div>
              }
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobApplicationsPage;
