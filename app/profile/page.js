'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaRegBuilding, FaEnvelope, FaGraduationCap, FaBriefcase, FaFileAlt, FaGlobe } from 'react-icons/fa';

const Profile = () => {
    const { isSignedIn, user } = useUser();
    const router = useRouter();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch the user's profile data from Supabase
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('clerk_id', user.id)
                .single();

            if (error) throw error;
            setProfileData(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isSignedIn && user) {
            fetchProfile();
        }
    }, []);

    if (!isSignedIn) {
        return (
            <div className="flex justify-center items-center h-screen ">
                <div className="text-xl text-gray-700">
                    Please sign in to view your profile.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen ">
                <div className="text-xl text-gray-700">Loading...</div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="max-w-3xl mx-auto my-12 p-8 bg-white shadow-xl rounded-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">No Profile Found</h1>
                <p className="text-lg text-gray-600 mb-6">
                    It seems like you haven{`'`}t completed your profile yet.
                </p>
                <button
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-200"
                    onClick={() => router.push('/profile/complete_profile')}
                >
                    Complete Your Profile
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-12 p-8 bg-white shadow-xl rounded-lg relative">
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-r from-blue-500 to-teal-400 rounded-t-lg"></div>

            <div className="relative -mt-24 flex items-center justify-center">
                <FaUserCircle className="text-white text-9xl shadow-md rounded-full" />
            </div>

            <h1 className="text-4xl font-bold text-center mt-6 text-gray-800">Profile</h1>
            <p className="text-lg text-center text-gray-500 mt-2">
                {profileData.role === 'job_seeker' ? 'Job Seeker' : 'Employer'}
            </p>

            <div className="mt-8 space-y-8">
                <div className="flex items-center space-x-4">
                    <FaEnvelope className="text-2xl text-blue-500" />
                    <div>
                        <p className="text-lg font-medium text-gray-800">Email</p>
                        <p className="text-md text-gray-600">{profileData.email}</p>
                    </div>
                </div>

                {profileData.role === 'job_seeker' && (
                    <>
                        <div className="flex items-center space-x-4">
                            <FaGraduationCap className="text-2xl text-blue-500" />
                            <div>
                                <p className="text-lg font-medium text-gray-800">Education</p>
                                <p className="text-md text-gray-600">{profileData.education || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <FaBriefcase className="text-2xl text-blue-500" />
                            <div>
                                <p className="text-lg font-medium text-gray-800">Experience</p>
                                <p className="text-md text-gray-600">{profileData.experience || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <FaFileAlt className="text-2xl text-blue-500" />
                            <div>
                                <p className="text-lg font-medium text-gray-800">Resume</p>
                                {profileData.resume_url ? (
                                    <a
                                        href={profileData.resume_url}
                                        target="_blank"
                                        className="text-md text-blue-500 underline"
                                    >
                                        View Resume
                                    </a>
                                ) : (
                                    <p className="text-md text-gray-600">Not provided</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {profileData.role === 'employer' && (
                    <>
                        <div className="flex items-center space-x-4">
                            <FaRegBuilding className="text-2xl text-blue-500" />
                            <div>
                                <p className="text-lg font-medium text-gray-800">Company Name</p>
                                <p className="text-md text-gray-600">{profileData.company_name || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <FaFileAlt className="text-2xl text-blue-500" />
                            <div>
                                <p className="text-lg font-medium text-gray-800">Company Profile</p>
                                <p className="text-md text-gray-600">{profileData.company_profile || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <FaGlobe className="text-2xl text-blue-500" />
                            <div>
                                <p className="text-lg font-medium text-gray-800">Company Website</p>
                                {profileData.company_website ? (
                                    <a
                                        href={profileData.company_website}
                                        target="_blank"
                                        className="text-md text-blue-500 underline"
                                    >
                                        Visit Website
                                    </a>
                                ) : (
                                    <p className="text-md text-gray-600">Not provided</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 flex flex-col space-y-4">
                <button
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-full shadow-lg hover:scale-105 transform transition-all duration-200"
                    onClick={() =>
                        profileData.role === 'employer'
                            ? router.push('/profile/jobs_posted')
                            : router.push('/profile/applications')
                    }
                >
                    View {profileData.role === 'employer' ? 'Jobs Posted' : 'Applications'}
                </button>

                {profileData.role === 'job_seeker' && (
                    <button
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-full shadow-lg hover:scale-105 transform transition-all duration-200"
                        onClick={() => router.push('/profile/chats')}
                    >
                        View Chats
                    </button>
                )}

                {profileData.role === 'employer' && (
                    <button
                        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-full shadow-lg hover:scale-105 transform transition-all duration-200"
                        onClick={() => router.push('/profile/post_job')}
                    >
                        Post a Job
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
