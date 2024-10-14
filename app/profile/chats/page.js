// 'use client';

// import { useState, useEffect } from 'react';
// import { supabase } from '@/app/supabase'; // Your Supabase instance
// import { useUser } from '@clerk/nextjs'; // Clerk for authentication
// import { useRouter } from 'next/navigation';

// const ChatPage = () => {
//   const { user, isSignedIn } = useUser(); // Get the current user
//   const router = useRouter();
  
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userData, setUserData] = useState({}); // Store employers' names keyed by sender ID

//   // Fetch most recent messages for the job seeker
//   const fetchMessages = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('messages')
//         .select('*')
//         .eq('recipient_id', user.id) // Only fetch messages sent to this job seeker
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       // Group messages by sender and keep the most recent message
//       const groupedMessages = data.reduce((acc, msg) => {
//         if (!acc[msg.sender_id] || new Date(msg.created_at) > new Date(acc[msg.sender_id].created_at)) {
//           acc[msg.sender_id] = msg; // Keep only the most recent message from each sender
//         }
//         return acc;
//       }, {});

//       // Convert the grouped messages object back into an array
//       setMessages(Object.values(groupedMessages));
//       fetchEmployersName(Object.keys(groupedMessages)); // Pass sender IDs to fetch names
//     } catch (err) {
//       setError('Error fetching messages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch the employer's name 
//   const fetchEmployersName = async (senderIds) => {
//     try {
//       if (senderIds.length === 0) return; // Exit if no sender IDs are available

//       // Fetch employers based on sender IDs
//       const { data, error } = await supabase
//         .from('users')
//         .select('id, clerk_id, name') // Assuming 'id' is the identifier for users and 'name' is what you want to retrieve
//         .in('clerk_id', senderIds); // Ensure you're using the correct field

//       if (error) {
//         console.error("Error fetching employers' names:", error);
//       } else {
//         // Map each user's ID to their name for easier lookup
//         const employersMap = {};
//         data.forEach(user => {
//           employersMap[user.id] = user.name; // Map ID to name
//         });
//         console.log(employersMap);
//         setUserData(employersMap); // Set the employers' names in state
//       }
//     } catch (err) {
//       console.error('Error in fetchEmployersName:', err);
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
//     return <div className="text-center mt-12">Loading messages...</div>;
//   }

//   if (error) {
//     return <div className="text-center mt-12 text-red-500">{error}</div>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
//       <h1 className="text-2xl font-semibold mb-6">Your Messages</h1>

//       {/* Message List */}
//       {messages.length === 0 ? (
//         <p>No messages yet. Check back later!</p>
//       ) : (
//         <ul className="space-y-4">
//           {messages.map((msg) => (
//             <li
//               key={msg.id}
//               className="border p-4 rounded-lg shadow-sm cursor-pointer"
//               onClick={() => router.push(`/messages/${msg.job_id}/${msg.sender_id}`)} // Navigate to the specific chat page
//             >
//               <p><strong>{userData[msg.sender_id] || msg.sender_id}</strong>: {msg.message_content}</p>
//               <span className="block text-sm text-gray-500 mt-2">
//                 {new Date(msg.created_at).toLocaleString()}
//               </span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default ChatPage;

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
    return <div className="text-center mt-12">Loading messages...</div>;
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-6">Your Messages</h1>

      {/* Message List */}
      {messages.length === 0 ? (
        <p>No messages yet. Check back later!</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className="border p-4 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push(`/profile/chats/${msg.sender_id}`)} // Navigate to the specific chat page
            >
              <p>
                <strong>
                  {userData[msg.sender_id] || msg.sender_id} {/* Display name or fallback to sender_id */}
                </strong>: {msg.message_content}
              </p>
              <span className="block text-sm text-gray-500 mt-2">
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatPage;
