// src/components/dashboard/InstructorDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, remove } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/firebaseConfig';
import '../../styles/components/Dashboard.css';

export function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const coursesRef = ref(database, 'courses');
    
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const instructorCourses = Object.entries(data)
          .filter(([_, course]) => course.instructorId === currentUser.uid)
          .map(([id, course]) => ({
            id,
            ...course
          }));
        setCourses(instructorCourses);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await remove(ref(database, `courses/${courseId}`));
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Instructor Dashboard</h1>
        <Link to="/create-course" className="create-course-btn">
          Create New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any courses yet.</p>
          <Link to="/create-course">Create your first course</Link>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.enrolledStudents || 0} students enrolled</p>
              <div className="course-actions">
                <Link to={`/edit-course/${course.id}`}>Edit</Link>
                <button onClick={() => handleDeleteCourse(course.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}