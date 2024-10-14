'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase'; // Your Supabase instance
import { useUser } from '@clerk/nextjs'; // Clerk for authentication
import { useRouter } from 'next/navigation';

const Page = ({ params }) => {
  const { user, isSignedIn } = useUser(); // Get the current user
  const senderID = params.messages; // Get the employer's ID
  const [jobId, setJobId] = useState(null); // State to store the job ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]); // State to store messages
  const [newMessage, setNewMessage] = useState(''); // State for new message input

  // Fetch the job ID based on senderID and current user ID
  const fetchJobId = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('job_id')
        .eq('sender_id', senderID)
        .eq('recipient_id', user.id)
        .limit(1); // Limit to 1 entry to ensure you only get one row
  
      if (error) throw error;

      if (data && data.length > 0) {
        setJobId(data[0].job_id); // Set the job ID from the first entry
      } else {
        throw new Error('No job ID found');
      }
    } catch (err) {
      setError('Error fetching job ID: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for the current chat
  const fetchMessages = async () => {
    try {
      const { data: messagesSent, error: errorSent } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id) // Job Seeker ID
        .eq('recipient_id', senderID); // Employer ID

      const { data: messagesReceived, error: errorReceived } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', senderID) // Employer ID
        .eq('recipient_id', user.id); // Job Seeker ID

      if (errorSent || errorReceived) {
        console.error('Error fetching messages:', errorSent || errorReceived);
        setError('Could not fetch messages');
      } else {
        // Combine and sort messages
        setMessages([...messagesSent, ...messagesReceived].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
      }
    } catch (err) {
      console.error('Error fetching messages:', err.message);
      setError('Could not fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!newMessage.trim()) return; // Do not send if the message is empty

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          job_id: jobId,
          sender_id: user.id, // Job seeker's ID
          recipient_id: senderID, // Employer's ID
          message_content: newMessage, // The actual message
          created_at: new Date().toISOString(), // Timestamp for the message
        });

      if (error) throw error;

      setNewMessage(''); // Clear the input field after sending
      fetchMessages(); // Fetch messages again to update the list
    } catch (err) {
      setError('Error sending message: ' + err.message);
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/'); // Redirect to sign-in if not logged in
      return;
    }
    if (user) { // Ensure user is defined before fetching
      fetchJobId(); // Fetch job ID when the component mounts
    }
  }, []);

  useEffect(() => {
    fetchMessages(); // Fetch messages when jobId changes
  }, []);

  if (loading) {
    return <div className="text-center mt-12">Loading job details...</div>;
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">Private Chat</h1>
      
      {/* Messages List */}
      <div className="mb-6 border rounded-md p-4 max-h-72 overflow-y-scroll">
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`border p-4 rounded-lg shadow-sm ${
                  msg.sender_id === user.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <p className='font-bold'>{msg.sender_id === user.id ? 'You:' : 'Employer:'}</p>
                <p>{msg.message_content}</p>
                <span className="block text-sm text-gray-500 mt-2">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Send Message Form */}
      <form onSubmit={sendMessage} className="flex space-x-4">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full border border-gray-300 rounded-md p-2"
        />
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Page;
