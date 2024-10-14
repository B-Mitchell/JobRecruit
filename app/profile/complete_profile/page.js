'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const Profile = () => {
    const { isSignedIn, user } = useUser(); // Always declare hooks at the top
    const router = useRouter();
    const [role, setRole] = useState('job_seeker'); // Default role
    const [isComplete, setIsComplete] = useState(false); // Track if the registration is complete
    const [loading, setLoading] = useState(true); // Added loading state
    const [submitting, setSubmitting] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        skills: [],
        education: '',
        experience: '',
        resumeUrl: '',
        companyName: '',
        companyProfile: '',
        companyWebsite: '',
    });

    // Fetch the profile from Supabase when the component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            if (user && isSignedIn) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('clerk_id', user.id)
                        .single(); // Fetch the profile based on Clerk user ID

                    if (error) {
                        console.error('Error fetching profile:', error);
                    } else if (data) {
                        setProfileData(data);
                        setIsComplete(true); // Mark the profile as complete if data exists
                    }
                } catch (err) {
                    console.error('Error fetching profile:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); // In case the user is not signed in, stop loading
            }
        };

        fetchProfile();
    }, [user, isSignedIn]); // Dependencies ensure the effect runs when these values change

    // If the user is not signed in, show a sign-in message
    if (!isSignedIn) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">
                    Please sign in to view your profile.
                </div>
            </div>
        );
    }

    // If loading, show a loading indicator
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">
                    Loading profile...
                </div>
            </div>
        );
    }

    // If the profile is already complete, show the profile or redirect
    if (isComplete) {
        return (
            <div className="text-center mt-10">
                <h1 className="text-2xl font-semibold mb-6">Profile Complete</h1>
                <p>Your profile has already been completed.</p>
                <button
                    onClick={() => router.push('/profile')} // Redirect to the dashboard or profile page
                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md"
                >
                    Go to profile
                </button>
            </div>
        );
    }

    // Submit profile data to Supabase
    const handleSubmit = async (e) => {
        setSubmitting(true);
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('users')
                .insert({
                    clerk_id: user.id,
                    role,
                    email: user.emailAddresses[0].emailAddress,
                    name: profileData.name,
                    skills: role === 'job_seeker' ? profileData.skills : null,
                    education: role === 'job_seeker' ? profileData.education : null,
                    experience: role === 'job_seeker' ? profileData.experience : null,
                    resume_url: role === 'job_seeker' ? profileData.resumeUrl : null,
                    company_name: role === 'employer' ? profileData.companyName : null,
                    company_profile: role === 'employer' ? profileData.companyProfile : null,
                    company_website: role === 'employer' ? profileData.companyWebsite : null,
                });

            if (error) throw error;
            console.log('Profile updated:', data);
            setIsComplete(true); // Mark registration as complete
            router.push('/profile');
        } catch (err) {
            console.error('Error updating profile:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Render the profile form
    return (
        <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold mb-6">Complete Your Profile</h1>

            {/* Toggle for Role */}
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">I am {role === 'job_seeker' ? 'a' : 'an'}:</label>
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        className={`px-4 py-2 rounded-md ${role === 'job_seeker' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setRole('job_seeker')}
                    >
                        Job Seeker
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 rounded-md ${role === 'employer' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setRole('employer')}
                    >
                        Employer
                    </button>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="name" className="block text-gray-700 font-medium">Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                />

                {/* Job Seeker Fields */}
                {role === 'job_seeker' && (
                    <>
                        <label htmlFor="skills" className="block text-gray-700 font-medium">Skills (comma-separated)</label>
                        <input
                            type="text"
                            name="skills"
                            value={profileData.skills.join(', ')}
                            onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(', ') })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />

                        <label htmlFor="education" className="block text-gray-700 font-medium">Education</label>
                        <input
                            type="text"
                            name="education"
                            value={profileData.education}
                            onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />

                        <label htmlFor="experience" className="block text-gray-700 font-medium">Experience</label>
                        <input
                            type="text"
                            name="experience"
                            value={profileData.experience}
                            onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />

                        <label htmlFor="resumeUrl" className="block text-gray-700 font-medium">Resume URL</label>
                        <input
                            type="text"
                            name="resumeUrl"
                            value={profileData.resumeUrl}
                            onChange={(e) => setProfileData({ ...profileData, resumeUrl: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </>
                )}

                {/* Employer Fields */}
                {role === 'employer' && (
                    <>
                        <label htmlFor="companyName" className="block text-gray-700 font-medium">Company Name</label>
                        <input
                            type="text"
                            name="companyName"
                            value={profileData.companyName}
                            onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />

                        <label htmlFor="companyProfile" className="block text-gray-700 font-medium">Company Profile</label>
                        <textarea
                            name="companyProfile"
                            value={profileData.companyProfile}
                            onChange={(e) => setProfileData({ ...profileData, companyProfile: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />

                        <label htmlFor="companyWebsite" className="block text-gray-700 font-medium">Company Website</label>
                        <input
                            type="text"
                            name="companyWebsite"
                            value={profileData.companyWebsite}
                            onChange={(e) => setProfileData({ ...profileData, companyWebsite: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </>
                )}

                {/* Submit Button */}
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md">
                    {submitting ? 'submittiing' : 'complete profile'}
                </button>
            </form>
        </div>
    );
};

export default Profile;
