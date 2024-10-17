'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/supabase';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const EmployerJobsPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    location: '',
    job_type: '',
    category: '',
  });

  const fetchEmployerJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', user.id); // Assuming `posted_by` links to the job poster

      if (error) throw error;
      setJobs(data);
    } catch (err) {
      setError('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployerJobs();
    }
  }, [user]);

  const handleEditClick = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      salary: job.salary,
      location: job.location,
      job_type: job.job_type,
      category: job.category,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('jobs')
        .update(formData)
        .eq('id', editingJob.id);

      if (error) throw error;

      // Refresh jobs after update
      fetchEmployerJobs();
      setEditingJob(null); // Close edit form
    } catch (err) {
      setError('Error updating job');
    }
  };

  if (loading) {
    return <div className="text-center mt-12">Loading your job postings...</div>;
  }

  if (error) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-10 px-8 pb-8 bg-white shadow-lg rounded-lg">
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-6 rounded-md text-white mb-8">
        <h1 className="text-3xl font-semibold">Your Job Postings</h1>
      </div>

      {/* Edit Job Form */}
      {editingJob && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold">Edit Job Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Job Title"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Job Description"
              rows={4}
            />
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Salary"
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Location"
            />
            <input
              type="text"
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Job Type"
            />
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Category"
            />
            <button type="submit" className="py-2 px-5 bg-green-600 text-white rounded-md">
              Update Job
            </button>
            <button
              type="button"
              onClick={() => setEditingJob(null)}
              className="py-2 px-5 bg-red-600 text-white rounded-md"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="text-center text-gray-600">You have not posted any jobs yet.</p>
      ) : (
        <ul className="space-y-6">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="border border-gray-300 p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{job.title}</h2>
                  <p className="text-gray-600 mt-2">{job.description}</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium text-gray-700">Salary: {job.salary}</p>
                    <p className="text-sm font-medium text-gray-700">Location: {job.location}</p>
                    <p className="text-sm font-medium text-gray-700">Job Type: {job.job_type}</p>
                    <p className="text-sm font-medium text-gray-700">Category: {job.category}</p>
                    <p className="text-sm text-gray-500">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Buttons Section */}
              <div className="flex justify-end items-center space-x-4 mt-6">
                <button
                  className="py-2 px-5 rounded-md bg-gradient-to-r from-blue-600 to-teal-600 text-white transition-colors"
                  onClick={() => router.push(`/profile/jobs_posted/${job.job_id}`)}
                >
                  See Applicants
                </button>
                <button
                  className="py-2 px-5 rounded-md bg-gradient-to-r from-green-600 to-blue-600 text-white transition-colors"
                  onClick={() => router.push(`/profile/jobs_posted/applications/${job.job_id}`)}
                >
                  View Applications
                </button>
                <button
                  className="py-2 px-5 rounded-md bg-gradient-to-r from-yellow-600 to-orange-600 text-white transition-colors"
                  onClick={() => handleEditClick(job)}
                >
                  Edit Job
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      
    </div>
  );
};

export default EmployerJobsPage;
