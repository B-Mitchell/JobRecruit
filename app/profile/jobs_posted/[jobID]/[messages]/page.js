// 'use client';

// import { useState, useEffect } from 'react';
// import { supabase } from '@/app/supabase'; // Your Supabase instance
// import { useUser } from '@clerk/nextjs'; // Clerk for authentication
// import { useRouter } from 'next/navigation';

// const MessagingPage = ({ params }) => {
//   const { user, isSignedIn } = useUser(); // Get the current user
//   const router = useRouter();
//   const senderID = params.messages; // The employer's ID
//   const [messages, setMessages] = useState([]); // State for messages
//   const [messageContent, setMessageContent] = useState(''); // State for new message input
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch messages between the employer and the selected job seeker for this job
//   // const fetchMessages = async () => {
//   //   try {
//   //     const { data, error } = await supabase
//   //       .from('messages')
//   //       .select('*')
//   //       .eq('job_id', params.jobID) // Fetch messages based on job ID
//   //       .or(`sender_id.eq.${user.id},recipient_id.eq.${senderID}`) // Ensure this condition is still valid
//   //       .order('created_at', { ascending: true });

//   //     if (error) throw error; // Handle error
//   //     setMessages(data); // Set messages to state
//   //   } catch (err) {
//   //     setError('Error fetching messages: ' + err.message); // Handle fetching error
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const fetchMessages = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('messages')
//         .select('*')
//         .eq('job_id', params.jobID) // Fetch messages based on job ID
//         .or(`sender_id.eq.${user.id},recipient_id.eq.${senderID}`) // Fetch messages for both sender and recipient
//         .order('created_at', { ascending: true });
  
//       if (error) throw error; // Handle error
//       setMessages(data); // Set messages to state
//     } catch (err) {
//       setError('Error fetching messages: ' + err.message); // Handle fetching error
//     } finally {
//       setLoading(false);
//     }
//   };
//   console.log('Job ID:', params.jobID);
// console.log('Sender ID:', senderID);


//   // Send a new message
//   const sendMessage = async (e) => {
//     e.preventDefault();
    
//     if (!messageContent.trim()) return; // Prevent sending empty messages

//     try {
//       const { error } = await supabase
//         .from('messages')
//         .insert([
//           {
//             sender_id: user.id,
//             recipient_id: senderID,
//             job_id: params.jobID, // Assuming jobID is passed via params
//             message_content: messageContent,
//           },
//         ]);
      
//       if (error) throw error; // Handle error
//       setMessageContent(''); // Clear the input after sending
//       fetchMessages(); // Refresh messages after sending
//     } catch (err) {
//       setError('Error sending message'); // Handle sending error
//     }
//   };

//   useEffect(() => {
//     if (!isSignedIn) {
//       router.push('/'); // Redirect to sign-in if not logged in
//     } else {
//       fetchMessages(); // Fetch messages if the user is signed in
//     }
//   }, [isSignedIn, user]);

//   if (loading) {
//     return <div className="text-center mt-12">Loading messages...</div>; // Loading state
//   }

//   if (error) {
//     return <div className="text-center mt-12 text-red-500">{error}</div>; // Error state
//   }

//   return (
//     <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
//       <h1 className="text-2xl font-semibold mb-6">Private Chat</h1>

//       {/* Message List */}
//       <div className="mb-6 max-h-60 overflow-y-scroll">
//         {messages.length === 0 ? (
//           <p>No messages yet. Start the conversation!</p>
//         ) : (
//           <ul className="space-y-4">
//             {messages.map((msg) => (
//               <li
//                 key={msg.id}
//                 className={`border p-4 rounded-lg shadow-sm ${
//                   msg.sender_id === user.id ? 'bg-blue-100' : 'bg-gray-100'
//                 }`}
//               >
//                 <p className='font-bold'>{msg.sender_id === user.id ? 'YOU:' : 'Employer:'}</p>
//                 <p>{msg.message_content}</p>
//                 <span className="block text-sm text-gray-500 mt-2">
//                   {new Date(msg.created_at).toLocaleString()} {/* Format date */}
//                 </span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* Send Message Form */}
//       <form onSubmit={sendMessage} className="flex space-x-4">
//         <textarea
//           value={messageContent}
//           onChange={(e) => setMessageContent(e.target.value)}
//           placeholder="Type your message..."
//           className="w-full border border-gray-300 rounded-md p-2"
//         />
//         <button
//           type="submit"
//           className="bg-green-500 text-white py-2 px-4 rounded-md"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default MessagingPage;

'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase'; // Your Supabase instance
import { useUser } from '@clerk/nextjs'; // Clerk for authentication
import { useRouter } from 'next/navigation';

const MessagingPage = ({ params }) => {
  const { user, isSignedIn } = useUser(); // Get the current user
  const router = useRouter();
  const jobSeekerID = params.messages; // The ID of the job seeker you want to message
  const [messages, setMessages] = useState([]); // State for messages
  const [messageContent, setMessageContent] = useState(''); // State for new message input
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [jobSeekerData, setJobSeekerData] = useState(null); // Store job seeker data

  // Fetch job seeker data
  const fetchJobSeekerData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', jobSeekerID) // Assuming user_id corresponds to the job seeker ID
      .single();

    if (error) {
      console.error('Error fetching job seeker data:', error.message);
      setError('Could not fetch job seeker data');
    } else {
      setJobSeekerData(data);
    }
  };

  // Fetch messages for the current chat
  const fetchMessages = async () => {
    try {
      const { data: messagesSent, error: errorSent } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)
        .eq('recipient_id', jobSeekerID);

      const { data: messagesReceived, error: errorReceived } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', jobSeekerID)
        .eq('recipient_id', user.id);

      if (errorSent || errorReceived) {
        console.error('Error fetching messages:', errorSent || errorReceived);
        setError('Could not fetch messages');
      } else {
        setMessages([...messagesSent, ...messagesReceived].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
      }
    } catch (err) {
      console.error('Error fetching messages:', err.message);
      setError('Could not fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/'); // Redirect to sign-in if not logged in
      return;
    }
    fetchMessages();
    fetchJobSeekerData();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return; // Prevent sending empty messages

    const { error } = await supabase
      .from('messages')
      .insert([{ sender_id: user.id, recipient_id: jobSeekerID, message_content: messageContent }]);

    if (error) {
      console.error('Error sending message:', error.message);
    } else {
      setMessageContent(''); // Clear the input after sending
      fetchMessages(); // Refresh messages after sending
    }
  };

  if (loading) {
    return <div className="text-center mt-12">Loading messages...</div>; // Loading state
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>; // Error state
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">
        Private Chat
      </h1>

      {/* Message List */}
      <div className="mb-6 max-h-72 overflow-y-scroll">
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
                <p className='font-bold'>{msg.sender_id === user.id ? 'You:' : ``}</p>
                <p>{msg.message_content}</p>
                <span className="block text-sm text-gray-500 mt-2">
                  {new Date(msg.created_at).toLocaleString()} {/* Format date */}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Send Message Form */}
      <form onSubmit={sendMessage} className="flex space-x-4">
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
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

export default MessagingPage;
