'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabase';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaBriefcase, FaChartPie, FaUsers } from 'react-icons/fa';

const AdminPanel = () => {
  const { user } = useUser();
  const router = useRouter();

  const adminEmails = ['mitchellonuorah77@gmail.com', 'onuorahugochukwu900@gmail.com'];
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdminAccess = () => {
      if (user) {
        if (!adminEmails.includes(user.primaryEmailAddress?.emailAddress)) {
          alert("You're not an admin!");
          router.push('/'); 
        } else {
          fetchData(); 
        }
      }
    };

    checkAdminAccess();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: jobsData, error: jobsError } = await supabase.from('jobs').select('*');
      if (jobsError) throw jobsError;
      setJobs(jobsData);

      const { data: usersData, error: usersError } = await supabase.from('users').select('*');
      if (usersError) throw usersError;
      setUsers(usersData);

      const activeJobsCount = await supabase.from('jobs').select('*', { count: 'exact' }).eq('status', 'active');
      const userCount = await supabase.from('users').select('*', { count: 'exact' });
      const applicationCount = await supabase.from('applications').select('*', { count: 'exact' });

      setAnalytics({
        activeJobs: activeJobsCount.count,
        userCount: userCount.count,
        applicationCount: applicationCount.count,
      });
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await supabase.from('jobs').delete().eq('id', jobId);
      setJobs(jobs.filter((job) => job.job_id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err.message);
    }
  };

  const handleEditJob = (job) => {
    // Implement edit job logic
    alert('you cannot edit jobs at this time')
  };

  if (loading) {
    return <div className="text-center mt-12">Loading admin panel...</div>;
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="w-[100%] overflow-x-hidden">

      <main className="flex-1 p-10 bg-gray-100">
        <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaChartPie className="text-3xl text-blue-500 mr-4" />
            <div>
              <h2 className="text-xl font-bold">Active Jobs</h2>
              <p className="text-lg">{jobs.length || 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaUsers className="text-3xl text-green-500 mr-4" />
            <div>
              <h2 className="text-xl font-bold">Total Users</h2>
              <p className="text-lg">{analytics.userCount || 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaBriefcase className="text-3xl text-red-500 mr-4" />
            <div>
              <h2 className="text-xl font-bold">Total Applications</h2>
              <p className="text-lg">{analytics.applicationCount || 0}</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-4">Job Management</h2>
          {jobs.length === 0 ? (
            <p>No jobs available.</p>
          ) : (
            <ul className="space-y-4">
              {jobs.map((job) => (
                <li key={job.id} className="border p-4 rounded-lg shadow-sm bg-white block md:flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <br/>
                  <div >
                    <button
                      className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700"
                      onClick={() => handleDeleteJob(job.job_id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 ml-2"
                      onClick={() => handleEditJob(job)}
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          {users.length === 0 ? (
            <p>No users available.</p>
          ) : (
            <ul className="space-y-4">
              {users.map((user) => (
                <li key={user.id} className="border p-4 rounded-lg shadow-sm bg-white flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{user.email}</h3>
                  <div>
                    {/* Add user management actions here */}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
