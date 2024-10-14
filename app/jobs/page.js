'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase'; // Adjust path as needed
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const JobListingPage = () => {
    const { isSignedIn, user } = useUser();
    const router = useRouter();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEmployerOrJobSeeker, setIsEmployerOrJobSeeker] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterJobType, setFilterJobType] = useState('');
    const [filterLocation, setFilterLocation] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            if (isSignedIn && user) {
                try {
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('role')
                        .eq('clerk_id', user.id)
                        .single();

                    if (error) throw error;

                    if (userData && (userData.role === 'employer' || userData.role === 'job_seeker')) {
                        setIsEmployerOrJobSeeker(true);

                        const { data: jobsData, error: jobsError } = await supabase
                            .from('jobs')
                            .select('*');

                        if (jobsError) throw jobsError;
                        setJobs(jobsData);
                    }
                } catch (err) {
                    console.error('Error fetching jobs or user role:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [isSignedIn, user]);

    const filteredJobs = jobs
        .filter((job) => job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter((job) => filterCategory ? job.category === filterCategory : true)
        .filter((job) => filterJobType ? job.job_type === filterJobType : true)
        .filter((job) => filterLocation ? job.location === filterLocation : true);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl text-gray-700">Loading...</div>
            </div>
        );
    }

    if (!isEmployerOrJobSeeker) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-teal-400">
                <div className="text-xl text-white">
                    Please sign in to view job listings or go to your PROFILE to complete registration.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-10 px-8 pb-8 bg-white shadow-lg rounded-xl">
            <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6 rounded-md text-white mb-8">
                <h1 className="text-3xl font-semibold">Find Your Next Job</h1>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search jobs by title, company, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex space-x-4">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-1/3 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                        <option value="marketing">Marketing</option>
                    </select>

                    <select
                        value={filterJobType}
                        onChange={(e) => setFilterJobType(e.target.value)}
                        className="w-1/3 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Job Types</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                    </select>

                    <select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="w-1/3 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Locations</option>
                        <option value="Remote">Remote</option>
                        <option value="New York">New York</option>
                        <option value="San Francisco">San Francisco</option>
                    </select>
                </div>
            </div>

            {/* Job Listings */}
            {filteredJobs.length === 0 ? (
                <p className="text-lg text-gray-500">No jobs match your criteria. Try adjusting your filters.</p>
            ) : (
                <ul className="space-y-6">
                    {filteredJobs.map((job) => (
                        <li key={job.id} className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer transition-all duration-150" onClick={() => router.push(`/jobs/${job.job_id}`)}>
                            <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
                            <p className="text-gray-600 mt-2">{job.description}</p>
                            <div className="block md:flex items-center mt-2 md:mt-4">
                                <p className="font-medium md:mr-3 text-gray-700">Salary: {job.salary}</p>
                                <p className="font-medium md:mr-3 text-gray-700">Location: {job.location}</p>
                                <p className="font-medium md:mr-3 text-gray-700">Job Type: {job.job_type}</p>
                                <p className="font-medium md:mr-3 text-gray-700">Category: {job.category}</p>
                            </div>
                            <p className="text-blue-600 mt-2">
                                <a href={job.company_website} target="_blank" rel="noopener noreferrer">Company Website</a>
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default JobListingPage;
