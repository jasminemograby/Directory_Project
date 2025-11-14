// Courses Section Component - Shows assigned, learning, and completed courses
import React from 'react';

const CoursesSection = ({ assignedCourses, learningCourses, completedCourses }) => {
  return (
    <div className="rounded-lg p-6" style={{ 
      backgroundColor: 'var(--bg-card)', 
      boxShadow: 'var(--shadow-card)', 
      borderColor: 'var(--bg-secondary)', 
      borderWidth: '1px', 
      borderStyle: 'solid' 
    }}>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Courses</h2>

      <div className="space-y-6">
        {/* Assigned but Not Started */}
        {assignedCourses && assignedCourses.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Assigned Courses ({assignedCourses.length})
            </h3>
            <div className="space-y-2">
              {assignedCourses.map((course, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--bg-tertiary)'
                  }}
                >
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {course.name || course.title}
                  </p>
                  {course.description && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {course.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Currently Learning */}
        {learningCourses && learningCourses.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Currently Learning ({learningCourses.length})
            </h3>
            <div className="space-y-2">
              {learningCourses.map((course, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--accent-orange)'
                  }}
                >
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {course.name || course.title}
                  </p>
                  {course.progress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                        <span style={{ color: 'var(--text-primary)' }}>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${course.progress}%`,
                            background: 'var(--gradient-accent)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Courses */}
        {completedCourses && completedCourses.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Completed Courses ({completedCourses.length})
            </h3>
            <div className="space-y-2">
              {completedCourses.map((course, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded border"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--accent-green)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {course.name || course.title}
                    </p>
                    <span className="px-2 py-1 text-xs rounded" style={{ 
                      backgroundColor: 'var(--accent-green)', 
                      color: 'white' 
                    }}>
                      ✓ Completed
                    </span>
                  </div>
                  {course.feedback && (
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Feedback:</strong> {course.feedback}
                    </p>
                  )}
                  {course.completedAt && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Completed on {new Date(course.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(!assignedCourses || assignedCourses.length === 0) &&
         (!learningCourses || learningCourses.length === 0) &&
         (!completedCourses || completedCourses.length === 0) && (
          <p style={{ color: 'var(--text-secondary)' }}>No courses data available yet.</p>
        )}
      </div>
    </div>
  );
};

export default CoursesSection;

