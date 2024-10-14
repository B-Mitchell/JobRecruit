'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase'; // Your Supabase instance
import { useUser } from '@clerk/nextjs'; // Clerk for authentication
import { useRouter } from 'next/navigation';

const ChatPage = ({ params }) => {
  const { user, isSignedIn } = useUser(); // Get the current user
  const senderID = params.messages; // Get the employer's ID from the params
  const [jobId, setJobId] = useState(null); // Store the job ID
  const [messages, setMessages] = useState([]); // Store messages
  const [newMessage, setNewMessage] = useState(''); // Input for new message
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch the job ID based on senderID and the current user (job seeker)
  const fetchJobId = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('job_id')
        .eq('sender_id', senderID)
        .eq('recipient_id', user.id)
        .limit(1); // Only need one row

      if (error) throw error;
      if (data.length > 0) setJobId(data[0].job_id);
      else throw new Error('No job ID found');
    } catch (err) {
      setError(`Error fetching job ID: ${err.message}`);
    }
  };

  // Fetch messages between job seeker and employer
  const fetchMessages = async () => {
    try {
      const { data: messagesSent, error: errorSent } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)
        .eq('recipient_id', senderID);

      const { data: messagesReceived, error: errorReceived } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', senderID)
        .eq('recipient_id', user.id);

      if (errorSent || errorReceived) {
        throw new Error(errorSent || errorReceived);
      } else {
        // Combine and sort messages by created_at
        const combinedMessages = [...messagesSent, ...messagesReceived].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setMessages(combinedMessages);
      }
    } catch (err) {
      setError(`Error fetching messages: ${err.message}`);
    } finally {
      setLoading(false)
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return; // Prevent sending empty messages

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          job_id: jobId,
          sender_id: user.id, // Job seeker's ID
          recipient_id: senderID, // Employer's ID
          message_content: newMessage,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      setNewMessage(''); // Clear input after sending
      fetchMessages(); // Refresh message list
    } catch (err) {
      setError(`Error sending message: ${err.message}`);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/'); // Redirect if not signed in
    } else {
      fetchJobId(); // Fetch job ID on mount
      fetchMessages(); // Fetch messages
    }
  }, []);

  if (loading) {
    return <div className="text-center mt-12">Loading chat...</div>;
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
                <p className="font-bold">{msg.sender_id === user.id ? 'You:' : 'Employer:'}</p>
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

export default ChatPage;
