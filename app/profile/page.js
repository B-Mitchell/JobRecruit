'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

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

    // Use useEffect to fetch profile data when the component mounts
    useEffect(() => {
        if (isSignedIn && user) {
            fetchProfile();
        }
    }, []);

    // If the user is not signed in, redirect or show a sign-in message
    if (!isSignedIn) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">
                    Please sign in to view your profile.
                </div>
            </div>
        );
    }

    // If data is loading, show a loading message
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    // If no profile exists, show a button to complete the profile
    if (!profileData) {
        return (
            <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-semibold mb-6">No Profile Found</h1>
                <p className="mb-4">It looks like you haven not completed your profile yet.</p>
                <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => router.push('/profile/complete_profile')}
                >
                    Complete Your Profile
                </button>
            </div>
        );
    }

    // Display the user's profile data
    return (
        <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold mb-6">Profile</h1>
            <p className="text-lg font-medium mb-4">
                Role: {profileData.role === 'job_seeker' ? 'Job Seeker' : 'Employer'}
            </p>

            <div className="mb-6">
                <p className="text-xl font-medium mb-2">Name: {profileData.name}</p>
                <p className="text-lg text-gray-600">Email: {profileData.email}</p>
                <br />
                <hr />
                <br />
            </div>

            {/* Job Seeker Fields */}
            {profileData.role === 'job_seeker' && (
                <>
                    <div className="mb-4">
                        <h2 className="text-xl font-medium">Skills</h2>
                        <p>{profileData.skills?.join(', ') || 'No skills provided'}</p>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-medium">Education</h2>
                        <p>{profileData.education || 'No education details provided'}</p>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-medium">Experience</h2>
                        <p>{profileData.experience || 'No experience details provided'}</p>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-medium">Resume URL</h2>
                        {profileData.resume_url ? (
                            <a href={profileData.resume_url} target="_blank" className="text-blue-500 underline">
                                View Resume
                            </a>
                        ) : (
                            <p>No resume uploaded</p>
                        )}
                    </div>
                </>
            )}

            {/* Employer Fields */}
            {profileData.role === 'employer' && (
                <>
                    <div className="mb-4">
                        <h2 className="text-xl font-medium">Company Name</h2>
                        <p>{profileData.company_name || 'No company name provided'}</p>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-medium">Company Profile</h2>
                        <p>{profileData.company_profile || 'No company profile provided'}</p>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-medium">Company Website</h2>
                        {profileData.company_website ? (
                            <a href={profileData.company_website} target="_blank" className="text-blue-500 underline">
                                Visit Website
                            </a>
                        ) : (
                            <p>No company website provided</p>
                        )}
                    </div>
                </>
            )}

            {/* Styled button */}
            <button
                className="w-full bg-green-600 text-white py-2 rounded-md mt-6 hover:bg-green-700 transition-colors"
                onClick={() => 
                    profileData.role === 'employer' 
                        ? router.push('/profile/jobs_posted') 
                        : router.push('/profile/applications')
                }
            >
                View all {profileData.role === 'employer' ? 'jobs posted' : 'applications'}
            </button>
            
            {profileData.role === 'job_seeker' && <button className="w-full bg-green-600 text-white py-2 rounded-md mt-6 hover:bg-green-700 transition-colors" onClick={() => router.push('/profile/chats')}>view chats</button>}
            {profileData.role === 'employer' && <button className="w-full bg-green-600 text-white py-2 rounded-md mt-6 hover:bg-green-700 transition-colors" onClick={() => router.push('/profile/post_job')}>Post Job</button>}
        </div>
    );
};

export default Profile;
