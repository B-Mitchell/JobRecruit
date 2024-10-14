'use client';
import { useUser, SignInButton, SignedOut } from '@clerk/nextjs';
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
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <div className="container mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Find Your Dream Job or Hire Top Talent</h1>
                    <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                        Whether you are a job seeker or an employer, we have got you covered! Explore opportunities or connect with top talent.
                    </p>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleFindJobsClick}
                            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 shadow-lg transition-all"
                        >
                            Find Jobs
                        </button>
                        <button
                            onClick={handlePostJobClick}
                            className="px-8 py-3 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-800 shadow-lg transition-all"
                        >
                            Post a Job
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12">
                {/* Job Search Bar */}
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-semibold mb-6">Search for Jobs</h2>
                    <div className="max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search jobs, skills, or companies..."
                            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                            onClick={handleFindJobsClick}
                            className="mt-4 w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition-all"
                        >
                            Search Jobs
                        </button>
                    </div>
                </div>

                {/* Key Actions Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* For Job Seekers */}
                    <div className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                        <h3 className="text-2xl font-bold mb-4">Are you a Job Seeker?</h3>
                        <p className="text-gray-600 mb-6">
                            Create your profile, search for jobs, and apply with just one click!
                        </p>
                        <button
                            onClick={handleFindJobsClick}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                        >
                            Search Jobs
                        </button>
                    </div>

                    {/* For Employers */}
                    <div className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                        <h3 className="text-2xl font-bold mb-4">Are you an Employer?</h3>
                        <p className="text-gray-600 mb-6">
                            Post job openings and connect with top talent in seconds.
                        </p>
                        <button
                            onClick={handlePostJobClick}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
                        >
                            Post a Job
                        </button>
                    </div>
                </div>

                {/* Popular Job Categories */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-semibold mb-8">Popular Job Categories</h2>
                    <div className="flex justify-center space-x-4 overflow-x-scroll scroll-smooth">
                        {['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing'].map((category) => (
                            <div
                                key={category}
                                className="p-6 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all hover:bg-gray-50"
                                onClick={() => router.push(`/jobs?category=${category.toLowerCase()}`)}
                            >
                                <h4 className="font-semibold text-lg text-blue-600">{category}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                {!isSignedIn && (
                    <div className="bg-yellow-100 p-8 rounded-lg shadow-lg text-center">
                        <h3 className="text-3xl font-bold mb-6">Join Us Today</h3>
                        <p className="text-gray-700 mb-8">
                            Sign up now to start applying for jobs or posting your openings.
                        </p>
                        <SignedOut>
                            <SignInButton mode="modal" className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-all"/> {/* Modal login for mobile */}
                        </SignedOut>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="container mx-auto text-center">
                    <p className="text-sm">© 2024 Job Recruitment System. All rights reserved.</p>
                    <div className="flex justify-center space-x-6 mt-4">
                        <a href="/about" className="hover:text-white transition-colors">About Us</a>
                        <a href="/contact" className="hover:text-white transition-colors">Contact</a>
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
