'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { isSignedIn } = useUser(); // Checking user authentication state
    const router = useRouter();

    const handleFindJobsClick = () => {
        router.push('/jobs'); // Navigate to job search page
    };

    const handlePostJobClick = () => {
        router.push('profile/post_job'); // Navigate to job posting page
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-blue-600">
                <div className="container mx-auto px-6 py-16 text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">Find Your Dream Job or Hire Top Talent</h1>
                    <p className="text-lg mb-6">
                        Whether you are a job seeker or an employer, we have got you covered!
                    </p>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleFindJobsClick}
                            className="px-6 py-3 bg-white text-blue-600 rounded-md text-lg font-semibold"
                        >
                            Find Jobs
                        </button>
                        <button
                            onClick={handlePostJobClick}
                            className="px-6 py-3 bg-blue-800 text-white rounded-md text-lg font-semibold"
                        >
                            Post a Job
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-10">
                {/* Job Search Bar */}
                <div className="mb-10 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Search for Jobs</h2>
                    <div className="max-w-3xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search jobs, skills, or companies..."
                            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm"
                        />
                        <button
                            onClick={handleFindJobsClick}
                            className="mt-4 w-full bg-green-600 text-white py-3 rounded-md font-semibold"
                        >
                            Search Jobs
                        </button>
                    </div>
                </div>

                {/* Key Actions Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {/* For Job Seekers */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Are you a Job Seeker?</h3>
                        <p className="text-gray-600 mb-4">
                            Create your profile, search for jobs, and apply with just one click!
                        </p>
                        <button
                            onClick={handleFindJobsClick}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md"
                        >
                            Search Jobs
                        </button>
                    </div>

                    {/* For Employers */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Are you an Employer?</h3>
                        <p className="text-gray-600 mb-4">
                            Post job openings and connect with top talent in seconds.
                        </p>
                        <button
                            onClick={handlePostJobClick}
                            className="px-6 py-2 bg-green-600 text-white rounded-md"
                        >
                            Post a Job
                        </button>
                    </div>
                </div>

                {/* Popular Job Categories */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-semibold mb-6">Popular Job Categories</h2>
                    <div className="flex justify-center space-x-4">
                        {['Engineering', 'Marketing', 'Design', 'Sales'].map((category) => (
                            <div
                                key={category}
                                className="p-4 bg-white rounded-lg shadow-md cursor-pointer"
                                onClick={() => router.push(`/jobs?category=${category.toLowerCase()}`)}
                            >
                                <h4 className="font-semibold text-lg text-blue-600">{category}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                {!isSignedIn && (
                    <div className="bg-yellow-100 p-6 rounded-lg shadow-md text-center">
                        <h3 className="text-2xl font-bold mb-4">Join Us Today</h3>
                        <p className="text-gray-700 mb-6">
                            Sign up now to start applying for jobs or posting your openings.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto text-center">
                    <p className="text-gray-400">© 2024 Job Recruitment System. All rights reserved.</p>
                    <div className="flex justify-center space-x-4 mt-4">
                        <a href="/about" className="text-gray-400 hover:text-white">About Us</a>
                        <a href="/contact" className="text-gray-400 hover:text-white">Contact</a>
                        <a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
