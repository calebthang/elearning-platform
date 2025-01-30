// src/components/courses/CourseCatalog.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/firebaseConfig';
import '../../styles/components/CourseCatalog.css';

export function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const coursesRef = ref(database, 'courses');
    
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const coursesList = Object.entries(data).map(([id, course]) => ({
          id,
          ...course,
        }));
        setCourses(coursesList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Course Catalog</h1>
        <p>Discover our wide range of courses and start learning today</p>
      </div>

      <div className="catalog-filters">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Categories</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="no-courses-state">
          <h2>No courses available</h2>
          <p>Check back later for new courses</p>
        </div>
      ) : (
        <div className="no-courses-state">
          <h2>No courses found</h2>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}