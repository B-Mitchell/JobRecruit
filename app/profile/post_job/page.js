'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase'; // Adjust path as needed
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Define categories for job postings (these should match the categories used on the homepage)
const jobCategories = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'marketing', label: 'Marketing' },
];

const PostJobPage = () => {
    const { isSignedIn, user } = useUser(); // User data from Clerk
    const router = useRouter();

    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        salary: '',
        location: '',
        jobType: 'full-time', // Default to full-time
        category: '', // Initialize category
        companyName: '',
        companyWebsite: '',
    });
    const [loading, setLoading] = useState(false);
    const [isEmployer, setIsEmployer] = useState(false); // To track if user is an employer
    const [loadingUserData, setLoadingUserData] = useState(true); // Loading state for user role check

    // Fetch user role from Supabase to check if the user is an employer
    useEffect(() => {
        const fetchUserRole = async () => {
            if (isSignedIn && user) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('role')
                        .eq('clerk_id', user.id)
                        .single();

                    if (error) throw error;

                    // Check if the user's role is 'employer'
                    if (data && data.role === 'employer') {
                        setIsEmployer(true); // User is an employer
                    }
                } catch (err) {
                    console.error('Error fetching user role:', err);
                } finally {
                    setLoadingUserData(false); // Role check is done
                }
            }
        };

        fetchUserRole();
    }, [isSignedIn, user]);

    const handlePostJob = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('jobs')
                .insert({
                    title: jobData.title,
                    description: jobData.description,
                    salary: jobData.salary,
                    location: jobData.location,
                    job_type: jobData.jobType,
                    category: jobData.category, // Add category to job data
                    company_name: jobData.companyName,
                    company_website: jobData.companyWebsite,
                    posted_by: user.id, // Clerk user ID
                });

            if (error) throw error;
            alert('posting successful!')
            setJobData({title: '',
            description: '',
            salary: '',
            location: '',
            jobType: 'full_time', // Default to full-time
            category: '', // Initialize category
            companyName: '',
            companyWebsite: '',})
        } catch (err) {
            console.error('Error posting job:', err);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // If user is not signed in or role checking is in progress, show a loading message
    if (loadingUserData) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">
                    Loading...
                </div>
            </div>
        );
    }

    // If the user is not an employer, show an error message or redirect
    if (!isEmployer) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-red-600">
                    You do not have permission to post jobs. Please contact support if you think this is a mistake.
                </div>
            </div>
        );
    }

    // If user is signed in and is an employer, render the job posting form
    return (
        <div className="max-w-3xl mx-auto my-10 px-6 pb-6 bg-white shadow-md rounded-lg">
            <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6 rounded-md text-white mb-8">
                <h1 className="text-3xl font-semibold">Post a New Job</h1>
            </div>
            

            <form onSubmit={handlePostJob} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-gray-700 font-medium">Job Title</label>
                    <input
                        type="text"
                        name="title"
                        value={jobData.title}
                        onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-gray-700 font-medium">Job Description</label>
                    <textarea
                        name="description"
                        value={jobData.description}
                        onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="salary" className="block text-gray-700 font-medium">Salary</label>
                    <input
                        type="text"
                        name="salary"
                        value={jobData.salary}
                        onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="location" className="block text-gray-700 font-medium">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={jobData.location}
                        onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="jobType" className="block text-gray-700 font-medium">Job Type</label>
                    <select
                        name="jobType"
                        value={jobData.jobType}
                        onChange={(e) => setJobData({ ...jobData, jobType: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="full-time">Full-Time</option>
                        <option value="part-time">Part-Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>

                {/* Category Selection */}
                <div>
                    <label htmlFor="category" className="block text-gray-700 font-medium">Category</label>
                    <select
                        name="category"
                        value={jobData.category}
                        onChange={(e) => setJobData({ ...jobData, category: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Select a Category</option>
                        {jobCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="companyName" className="block text-gray-700 font-medium">Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        value={jobData.companyName}
                        onChange={(e) => setJobData({ ...jobData, companyName: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="companyWebsite" className="block text-gray-700 font-medium">Company Website</label>
                    <input
                        type="text"
                        name="companyWebsite"
                        value={jobData.companyWebsite}
                        onChange={(e) => setJobData({ ...jobData, companyWebsite: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-full shadow-lg hover:scale-105 transform transition-all duration-200"
                    disabled={loading}
                >
                    {loading ? 'Posting Job...' : 'Post Job'}
                </button>
            </form>
        </div>
    );
};

export default PostJobPage;
