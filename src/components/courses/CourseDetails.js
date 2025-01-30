// src/components/courses/CourseDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';

export function CourseDetails() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      const db = getDatabase(app);
      const courseRef = ref(db, `courses/${courseId}`);
      
      try {
        const snapshot = await get(courseRef);
        if (snapshot.exists()) {
          setCourse(snapshot.val());
          
          // Check enrollment status
          if (currentUser) {
            const enrollmentRef = ref(db, `enrollments/${currentUser.uid}/${courseId}`);
            const enrollmentSnapshot = await get(enrollmentRef);
            setIsEnrolled(enrollmentSnapshot.exists());
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, currentUser]);

  const handleEnroll = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      const db = getDatabase(app);
      const enrollmentRef = ref(db, `enrollments/${currentUser.uid}/${courseId}`);
      
      await set(enrollmentRef, {
        enrolledAt: new Date().toISOString(),
        status: 'in-progress',
        progress: 0
      });

      setIsEnrolled(true);
      navigate(`/courses/${courseId}/learn`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <p className="mt-2 text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
            Browse all courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="mt-4 text-lg text-gray-600">{course.description}</p>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">What you'll learn</h2>
            <ul className="mt-4 grid grid-cols-1 gap-4">
              {course.learningObjectives?.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Course content</h2>
            <div className="mt-4 border rounded-lg divide-y">
              {course.modules?.map((module, index) => (
                <div key={index} className="p-4">
                  <h3 className="font-medium text-gray-900">{module.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{module.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={course.instructorAvatar || '/placeholder-avatar.jpg'}
                    alt={course.instructorName}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{course.instructorName}</p>
                    <p className="text-sm text-gray-500">Course Instructor</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-b py-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total lessons</span>
                  <span className="font-medium">{course.totalLessons}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium">{course.level}</span>
                </div>
              </div>

              {isEnrolled ? (
                <Link
                  to={`/courses/${courseId}/learn`}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}