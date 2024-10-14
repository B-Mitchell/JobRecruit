'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase'; // Your Supabase instance
import { useUser } from '@clerk/nextjs'; // Clerk for authentication
import { useRouter } from 'next/navigation';

const ChatPage = () => {
  const { user, isSignedIn } = useUser(); // Get the current user
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({}); // Store employers' names keyed by sender ID

  // Fetch most recent messages for the job seeker
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', user.id) // Only fetch messages sent to this job seeker
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by sender and keep the most recent message
      const groupedMessages = data.reduce((acc, msg) => {
        if (!acc[msg.sender_id] || new Date(msg.created_at) > new Date(acc[msg.sender_id].created_at)) {
          acc[msg.sender_id] = msg; // Keep only the most recent message from each sender
        }
        return acc;
      }, {});

      // Convert the grouped messages object back into an array
      setMessages(Object.values(groupedMessages));
      fetchEmployersName(Object.keys(groupedMessages)); // Pass sender IDs to fetch names
    } catch (err) {
      setError('Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employer names based on sender IDs
  const fetchEmployersName = async (senderIds) => {
    if (senderIds.length === 0) return; // Exit if no sender IDs are available

    try {
      const { data, error } = await supabase
        .from('users')
        .select('clerk_id, name') // Assuming 'clerk_id' is the identifier for users
        .in('clerk_id', senderIds); // Ensure you're using the correct field

      if (error) {
        console.error("Error fetching employers' names:", error);
      } else {
        const employersMap = data.reduce((acc, user) => {
          acc[user.clerk_id] = user.name; // Map clerk_id to name
          return acc;
        }, {});

        setUserData(employersMap); // Set the employers' names in state
      }
    } catch (err) {
      console.error('Error in fetchEmployersName:', err);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/'); // Redirect to sign-in if not logged in
    } else {
      fetchMessages(); // Fetch messages if the user is signed in
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">

      {/* Profile section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6 rounded-md text-white mb-8">
        <h1 className="text-3xl font-semibold">Welcome, {user?.fullName}</h1>
        <p className="text-lg">Here are your recent messages:</p>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-600">You have no messages yet. Check back later!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className="border p-4 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/profile/chats/${msg.sender_id}`)} // Navigate to the specific chat page
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    {userData[msg.sender_id] || msg.sender_id} {/* Display name or fallback to sender_id */}
                  </p>
                  <p className="text-gray-600">{msg.message_content}</p>
                </div>
                <span className="block text-sm text-gray-500">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatPage;
