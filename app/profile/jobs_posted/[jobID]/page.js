'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const JobApplicantsPage = ({ params }) => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const jobId = params.jobID;
  
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullCoverLetter, setShowFullCoverLetter] = useState({}); // Track expanded state

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('clerk_id', user.id)
        .single();

      if (error || !data || data.role !== 'employer') {
        throw new Error('Access denied. Only employers can view this page.');
      }
    } catch (err) {
      setError(err.message || 'Error verifying role');
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId);

      if (error) throw error;
      setApplicants(data);
    } catch (err) {
      setError('Error fetching applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    } else if (user) {
      checkUserRole();
      fetchApplicants();
    }
  }, []);

  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  };

  const toggleCoverLetter = (applicantId) => {
    setShowFullCoverLetter((prev) => ({
      ...prev,
      [applicantId]: !prev[applicantId], // Toggle expanded state
    }));
  };

  if (loading) {
    return <div className="text-center mt-12">Loading applicants...</div>;
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">Applicants</h1>

      {applicants.length === 0 ? (
        <p>No applicants have applied for this job yet.</p>
      ) : (
        <ul className="space-y-4">
          {applicants.map((applicant) => (
            <li key={applicant.id} className="border p-4 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer" onClick={() => router.push(`/profile/jobs_posted/${jobId}/${applicant.user_id}`)}>
              <h2 className="text-xl font-semibold">{applicant.name}</h2>
              <p className="text-gray-600">Email: {applicant.email}</p>
              <a 
                href={applicant.resume_url}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 underline"
              >
                View Resume
              </a>

              {/* Display Cover Letter with Toggle */}
              <p className="mt-2">
                {applicant.cover_letter ? (
                  <>
                    {showFullCoverLetter[applicant.id]
                      ? `Cover Letter: ${applicant.cover_letter}`
                      : `Cover Letter: ${truncateText(applicant.cover_letter, 20)}`}
                    <button
                      onClick={() => toggleCoverLetter(applicant.id)}
                      className="text-blue-500 underline ml-2"
                    >
                      {showFullCoverLetter[applicant.id] ? 'Show less' : 'Read more'}
                    </button>
                  </>
                ) : (
                  'No cover letter provided'
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobApplicantsPage;
