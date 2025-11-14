// Courses Tab - With Filter & Sort
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';

const ProfileCoursesTab = ({ 
  assignedCourses = [],
  learningCourses = [],
  completedCourses = [],
  taughtCourses = []
}) => {
  const { theme } = useApp();
  const [filter, setFilter] = useState('all'); // all, assigned, learning, completed, taught
  const [sortBy, setSortBy] = useState('name'); // name, date, progress

  // Combine all courses for filtering
  const allCourses = useMemo(() => {
    const courses = [];
    
    assignedCourses.forEach(course => {
      courses.push({ ...course, type: 'assigned', status: 'assigned' });
    });
    
    learningCourses.forEach(course => {
      courses.push({ ...course, type: 'learning', status: 'in-progress' });
    });
    
    completedCourses.forEach(course => {
      courses.push({ ...course, type: 'completed', status: 'completed' });
    });
    
    taughtCourses.forEach(course => {
      courses.push({ ...course, type: 'taught', status: course.status || 'active' });
    });
    
    return courses;
  }, [assignedCourses, learningCourses, completedCourses, taughtCourses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    if (filter === 'all') return allCourses;
    return allCourses.filter(course => course.type === filter);
  }, [allCourses, filter]);

  // Sort courses
  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses];
    
    if (sortBy === 'name') {
      sorted.sort((a, b) => {
        const nameA = (a.course_name || a.name || a.title || '').toLowerCase();
        const nameB = (b.course_name || b.name || b.title || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.completed_at || a.created_at || 0);
        const dateB = new Date(b.completed_at || b.created_at || 0);
        return dateB - dateA;
      });
    } else if (sortBy === 'progress') {
      sorted.sort((a, b) => {
        const progressA = a.progress || 0;
        const progressB = b.progress || 0;
        return progressB - progressA;
      });
    }
    
    return sorted;
  }, [filteredCourses, sortBy]);

  const getStatusColor = (status) => {
    if (status === 'completed') {
      return theme === 'day-mode' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-green-900/30 text-green-300 border-green-800';
    } else if (status === 'in-progress') {
      return theme === 'day-mode' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-900/30 text-blue-300 border-blue-800';
    } else if (status === 'assigned') {
      return theme === 'day-mode' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-gray-800 text-gray-300 border-gray-700';
    }
    return theme === 'day-mode' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-purple-900/30 text-purple-300 border-purple-800';
  };

  return (
    <div className="space-y-6">
      {/* Filter & Sort Controls */}
      <div className={`rounded-lg p-4 ${
        theme === 'day-mode' 
          ? 'bg-white border border-gray-200' 
          : 'bg-slate-800 border border-gray-700'
      }`}>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${
              theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Filter:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-3 py-1 rounded border text-sm ${
                theme === 'day-mode'
                  ? 'bg-white border-gray-300 text-gray-700'
                  : 'bg-slate-700 border-gray-600 text-gray-300'
              }`}
            >
              <option value="all">All Courses</option>
              <option value="assigned">Assigned</option>
              <option value="learning">In Progress</option>
              <option value="completed">Completed</option>
              {taughtCourses.length > 0 && <option value="taught">Taught</option>}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${
              theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-1 rounded border text-sm ${
                theme === 'day-mode'
                  ? 'bg-white border-gray-300 text-gray-700'
                  : 'bg-slate-700 border-gray-600 text-gray-300'
              }`}
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="progress">Progress</option>
            </select>
          </div>

          {/* Count */}
          <div className={`ml-auto text-sm ${
            theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Showing {sortedCourses.length} of {allCourses.length} courses
          </div>
        </div>
      </div>

      {/* Courses List */}
      {sortedCourses.length > 0 ? (
        <div className="space-y-3">
          {sortedCourses.map((course, idx) => (
            <div
              key={course.course_id || course.id || idx}
              className={`rounded-lg p-4 border ${
                theme === 'day-mode'
                  ? 'bg-white border-gray-200'
                  : 'bg-slate-800 border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold ${
                      theme === 'day-mode' ? 'text-gray-800' : 'text-gray-200'
                    }`}>
                      {course.course_name || course.name || course.title || 'Untitled Course'}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(course.status)}`}>
                      {course.status || course.type}
                    </span>
                  </div>
                  
                  {course.description && (
                    <p className={`text-sm mb-2 ${
                      theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {course.description}
                    </p>
                  )}

                  {/* Progress Bar for Learning Courses */}
                  {course.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'}>
                          Progress
                        </span>
                        <span className={theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${
                        theme === 'day-mode' ? 'bg-gray-200' : 'bg-gray-700'
                      }`}>
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Feedback for Completed Courses */}
                  {course.feedback && (
                    <div className={`mt-2 p-2 rounded ${
                      theme === 'day-mode' ? 'bg-gray-50' : 'bg-slate-700/50'
                    }`}>
                      <p className={`text-xs font-medium mb-1 ${
                        theme === 'day-mode' ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        Feedback:
                      </p>
                      <p className={`text-sm ${
                        theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {course.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`rounded-lg p-6 text-center ${
          theme === 'day-mode'
            ? 'bg-white border border-gray-200'
            : 'bg-slate-800 border border-gray-700'
        }`}>
          <p className={theme === 'day-mode' ? 'text-gray-600' : 'text-gray-400'}>
            No courses found.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileCoursesTab;

