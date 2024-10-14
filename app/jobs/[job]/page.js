'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/app/supabase';
import { useRouter } from 'next/navigation';

const JobApplicationPage = ({ params }) => {
    const jobId = params.job; // Extract jobId from params
    const { user } = useUser();
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isJobSeeker, setIsJobSeeker] = useState(false); // State to track if user is a job seeker

    // Fetch the job data based on jobId
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('job_id', jobId)
                    .single();

                if (error) throw error;

                setJob(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    // Check if the user is a job seeker
    useEffect(() => {
        const checkUserRole = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('role')
                        .eq('clerk_id', user.id)
                        .single();

                    if (error) throw error;

                    // Set isJobSeeker state based on user role
                    setIsJobSeeker(data.role === 'job_seeker');
                } catch (err) {
                    setError(err.message);
                }
            }
        };

        checkUserRole();
    }, [user]);

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);

        // Ensure job ID is defined
        if (!job || !job.job_id) {
            setError('Job ID is not available. Please reload the page.');
            setApplying(false);
            return;
        }

        const formData = new FormData(e.target);
        const applicationData = {
            user_id: user.id,
            job_id: job.job_id,
            job_title: job.title,
            company_name: job.company_name,
            name: formData.get('name'),
            email: formData.get('email'),
            resume_url: formData.get('resume_url'), // Link to the uploaded resume
            cover_letter: formData.get('cover_letter'),
        };

        console.log('Submitting application:', applicationData); // Debugging log

        try {
            const { data, error } = await supabase
                .from('applications')
                .insert(applicationData);

            if (error) throw error;

            console.log('Application submitted:', data);
            alert('Application submitted successfully!');
            router.push('/jobs');
        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-semibold mb-6">Loading Job Details...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-semibold mb-6">Error Fetching Job</h1>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-semibold mb-6">Job not found</h1>
                <p className="text-gray-600">The job you are trying to apply for does not exist.</p>
            </div>
        );
    }

    // If the user is not a job seeker, show an error message
    if (!isJobSeeker) {
        return (
            <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-semibold mb-6">Access Denied</h1>
                <p className="text-red-500">Only job seekers can apply for jobs. Please register as a job seeker to apply.</p>
            </div>
        );
    }

    // Render the job application form
    return (
        <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold mb-6">Apply for {job.title}</h1>
            {error && <div className="text-red-500">{error}</div>}
            <form onSubmit={handleApply} className="space-y-4">
                <label htmlFor="name" className="block text-gray-700 font-medium">Full Name</label>
                <input
                    type="text"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                />

                <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
                <input
                    type="email"
                    name="email"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                />

                <label htmlFor="resume_url" className="block text-gray-700 font-medium">Resume Link</label>
                <input
                    type="url"
                    name="resume_url"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                    placeholder="https://your-resume-link.com"
                />

                <label htmlFor="cover_letter" className="block text-gray-700 font-medium">Cover Letter</label>
                <textarea
                    name="cover_letter"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                ></textarea>

                <button
                    type="submit"
                    className={`w-full bg-blue-600 text-white py-2 rounded-md ${applying && 'opacity-50'}`}
                    disabled={applying}
                >
                    {applying ? 'Applying...' : 'Submit Application'}
                </button>
            </form>
        </div>
    );
};

export default JobApplicationPage;
