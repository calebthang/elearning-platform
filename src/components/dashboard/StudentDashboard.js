// src/components/dashboard/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, get } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/firebaseConfig';
import '../../styles/components/Dashboard.css';

export function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!currentUser?.uid) return;

      const enrollmentsRef = ref(database, `enrollments/${currentUser.uid}`);
      
      const unsubscribe = onValue(enrollmentsRef, async (snapshot) => {
        const enrollments = snapshot.val();
        if (enrollments) {
          const coursesPromises = Object.entries(enrollments).map(async ([courseId, enrollment]) => {
            const courseSnapshot = await get(ref(database, `courses/${courseId}`));
            return {
              id: courseId,
              ...courseSnapshot.val(),
              progress: enrollment.progress,
              status: enrollment.status
            };
          });

          const courses = await Promise.all(coursesPromises);
          setEnrolledCourses(courses);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchCourses();
  }, [currentUser?.uid]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>My Learning Dashboard</h1>
      {enrolledCourses.length === 0 ? (
        <div>
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses">Browse Courses</Link>
        </div>
      ) : (
        <div className="enrolled-courses">
          {enrolledCourses.map(course => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>Progress: {course.progress}%</p>
              <Link to={`/courses/${course.id}`}>Continue Learning</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}