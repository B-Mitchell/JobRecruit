// 'use client';
// import { useEffect, useState } from 'react';
// import { supabase } from '@/app/supabase'; // Adjust path as needed
// import { useUser } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';

// const JobListingPage = () => {
//     const { isSignedIn, user } = useUser();
//     const router = useRouter();

//     const [jobs, setJobs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isEmployerOrJobSeeker, setIsEmployerOrJobSeeker] = useState(false);

//     useEffect(() => {
//         const fetchJobs = async () => {
//             if (isSignedIn && user) {
//                 try {
//                     // Check the user's role
//                     const { data: userData, error } = await supabase
//                         .from('users')
//                         .select('role')
//                         .eq('clerk_id', user.id)
//                         .single();

//                     if (error) throw error;

//                     // If the user is either an employer or job seeker
//                     if (userData && (userData.role === 'employer' || userData.role === 'job_seeker')) {
//                         setIsEmployerOrJobSeeker(true);

//                         // Fetch jobs from Supabase
//                         const { data: jobsData, error: jobsError } = await supabase
//                             .from('jobs')
//                             .select('*');

//                         if (jobsError) throw jobsError;
//                         setJobs(jobsData);
//                     }
//                 } catch (err) {
//                     console.error('Error fetching jobs or user role:', err);
//                 } finally {
//                     setLoading(false);
//                 }
//             } else {
//                 setLoading(false);
//             }
//         };

//         fetchJobs();
//     }, [isSignedIn, user]);

//     // Show loading state
//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-gray-100">
//                 <div className="text-xl text-gray-600">Loading...</div>
//             </div>
//         );
//     }

//     // If user is not signed in or is not an employer/job seeker
//     if (!isEmployerOrJobSeeker) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-gray-100">
//                 <div className="text-xl text-gray-600">
//                     Please sign in to view job listings or go to PROFILE complete your registration.
//                 </div>
//             </div>
//         );
//     }

//     // Render the job listings
//     return (
//         <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
//             <h1 className="text-2xl font-semibold mb-6">Job Listings</h1>
//             {jobs.length === 0 ? (
//                 <p>No jobs available at the moment.</p>
//             ) : (
//                 <ul className="space-y-4">
//                     {jobs.map((job) => (
//                         <li key={job.id} className="border p-4 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer" onClick={() => router.push(`/jobs/${job.job_id}`)}>
//                             <h2 className="text-xl font-semibold">{job.title}</h2>
//                             <p className="text-gray-600">{job.description}</p>
//                             <p className="font-medium">Salary: {job.salary}</p>
//                             <p className="font-medium">Location: {job.location}</p>
//                             <p className="font-medium">Job Type: {job.job_type}</p>
//                             <p className="font-medium">Category: {job.category}</p>
//                             <p className="font-medium">Company: {job.company_name}</p>
//                             <a href={job.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//                                 Company Website
//                             </a>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// };

// export default JobListingPage;

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

    const [searchQuery, setSearchQuery] = useState(''); // For search functionality
    const [filterCategory, setFilterCategory] = useState(''); // For filtering by category
    const [filterJobType, setFilterJobType] = useState(''); // For filtering by job type
    const [filterLocation, setFilterLocation] = useState(''); // For filtering by location

    useEffect(() => {
        const fetchJobs = async () => {
            if (isSignedIn && user) {
                try {
                    // Check the user's role
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('role')
                        .eq('clerk_id', user.id)
                        .single();

                    if (error) throw error;

                    // If the user is either an employer or job seeker
                    if (userData && (userData.role === 'employer' || userData.role === 'job_seeker')) {
                        setIsEmployerOrJobSeeker(true);

                        // Fetch jobs from Supabase
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

    // Function to handle search and filter
    const filteredJobs = jobs
        .filter((job) => {
            // Filter by search query
            return (
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.company_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        })
        .filter((job) => {
            // Filter by category if selected
            return filterCategory ? job.category === filterCategory : true;
        })
        .filter((job) => {
            // Filter by job type if selected
            return filterJobType ? job.job_type === filterJobType : true;
        })
        .filter((job) => {
            // Filter by location if selected
            return filterLocation ? job.location === filterLocation : true;
        });

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    // If user is not signed in or is not an employer/job seeker
    if (!isEmployerOrJobSeeker) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">
                    Please sign in to view job listings or go to PROFILE to complete your registration.
                </div>
            </div>
        );
    }

    // Render the job listings with search and filters
    return (
        <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold mb-6">Job Listings</h1>

            {/* Search and Filter Section */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by title, description, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 rounded-md"
                />

                <div className="flex space-x-4 mb-4">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-1/3 p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All Categories</option>
                        <option value="technology">technology</option>
                        <option value="finance">finance</option>
                        <option value="healthcare">healthcare</option>
                        <option value="education">education</option>
                        <option value="marketing">marketing</option>
                    </select>

                    <select
                        value={filterJobType}
                        onChange={(e) => setFilterJobType(e.target.value)}
                        className="w-1/3 p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All Job Types</option>
                        <option value="full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        {/* Add more job types as needed */}
                    </select>

                    <select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="w-1/3 p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All Locations</option>
                        <option value="Remote">Remote</option>
                        <option value="New York">New York</option>
                        <option value="San Francisco">San Francisco</option>
                        {/* Add more locations as needed */}
                    </select>
                </div>
            </div>

            {/* Job Listings */}
            {filteredJobs.length === 0 ? (
                <p>No jobs match your criteria.</p>
            ) : (
                <ul className="space-y-4">
                    {filteredJobs.map((job) => (
                        <li key={job.id} className="border p-4 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer" onClick={() => router.push(`/jobs/${job.job_id}`)}>
                            <h2 className="text-xl font-semibold">{job.title}</h2>
                            <p className="text-gray-600">{job.description}</p>
                            <p className="font-medium">Salary: {job.salary}</p>
                            <p className="font-medium">Location: {job.location}</p>
                            <p className="font-medium">Job Type: {job.job_type}</p>
                            <p className="font-medium">Category: {job.category}</p>
                            <p className="font-medium">Company: {job.company_name}</p>
                            <a href={job.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                Company Website
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default JobListingPage;
