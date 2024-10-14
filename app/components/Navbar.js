'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignInButton, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const Navbar = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { user, isSignedIn } = useUser(); // Get the signed-in user details

    // handle navigation
    const handleNavigation = (path) => {
        router.push(path);
        setIsOpen(prev => !prev);
    };

    return (
        <nav className="bg-white shadow-md p-3 text-[1rem]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 align-middle mt-4">
                        <h1 className="text-2xl font-bold text-[#1D4ED8] cursor-pointer" onClick={() => handleNavigation('/')}>
                            JobRecruit
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-4">
                        <button onClick={() => handleNavigation('/')} className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md font-medium">Home</button>
                        { isSignedIn && <button onClick={() => handleNavigation('/profile')} className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md font-medium">profile</button>}
                        <button onClick={() => handleNavigation('/jobs')} className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md font-medium">Jobs</button>
                        {
                            isSignedIn && <button className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md font-medium" onClick={() => handleNavigation('/profile/jobs_posted')}>chat</button>
                        }
                        <button onClick={() => handleNavigation('/admin')} className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md font-medium">Admin</button>

                        {/* Signed In View */}
                        <SignedIn>
                            <UserButton /> {/* Clerk's UserButton handles profile and logout */}
                        </SignedIn>

                        {/* Signed Out View */}
                        <SignedOut>
                            <SignInButton mode="modal" className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md font-medium"/> {/* Modal login */}
                        </SignedOut>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:bg-gray-200 focus:outline-none" onClick={() => setIsOpen(!isOpen)} aria-controls="mobile-menu" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} shadow-lg`} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
                    <button onClick={() => handleNavigation('/')} className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium w-[100%]">Home</button>
                    {  isSignedIn && <button onClick={() => handleNavigation('/profile')} className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium w-[100%]">Profile</button>}
                    <button onClick={() => handleNavigation('/jobs')} className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium w-[100%]">Jobs</button>
                    {
                        isSignedIn && <button className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium w-[100%]" onClick={() => handleNavigation('/profile/jobs_posted')}>chat</button>
                    }
                    <button onClick={() => handleNavigation('/admin')} className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium w-[100%]">Admin</button>

                    {/* Signed In View */}
                    <br/><br/>
                    <SignedIn>
                        <UserButton /> {/* Clerk's UserButton for mobile view */}
                    </SignedIn>

                    {/* Signed Out View */}
                    <br/>
                    <SignedOut>
                        <SignInButton mode="modal" className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium w-[100%]"/> {/* Modal login for mobile */}
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
