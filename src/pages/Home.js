// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Home.css';

export function Home() {
  const featuredCourses = [
    {
      id: 1,
      title: 'Introduction to Python',
      instructor: 'John Doe',
      rating: '5.5',
      image: '/placeholder.jpg'
    },
    {
      id: 2,
      title: 'Web Dev Basics',
      instructor: 'John Doe',
      rating: '5.5',
      image: '/placeholder.jpg'
    },
    {
      id: 3,
      title: 'Data Science Fundamentals',
      instructor: 'John Doe',
      rating: '5.5',
      image: '/placeholder.jpg'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Learn Without Limits</h1>
          <p className="hero-subtitle">Access world-class education from anywhere, anytime</p>
          <Link to="/courses" className="get-started-btn">Get Started</Link>
        </div>
        <div className="hero-images">
          {/* Add your images here */}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="featured-courses">
        <h2 className="section-title">Featured Courses</h2>
        <div className="courses-grid">
          {featuredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-image"></div>
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-instructor">{course.instructor}</p>
                <span className="course-rating">{course.rating}</span>
                <div style={{ marginTop: '15px' }}>
                  <Link to={`/courses/${course.id}`} className="enroll-btn">Enroll Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works?</h2>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">1</div>
            <h3>Browse Courses</h3>
            <p>Explore our range courses</p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h3>Enroll & Learn</h3>
            <p>Sign up and start learning at your own pace</p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h3>Get Certified</h3>
            <p>Complete courses and earn certificates</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <div className="testimonial">
        <div className="testimonial-image"></div>
        <p className="testimonial-quote">"This platform changed my life"</p>
        <p>I was able to learn new skills and land my dream job thanks to the courses on this platform. The instructors are top-notch and the content is always up-to-date.</p>
        <p className="testimonial-author">Sarah L. - Web Developer</p>
      </div>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to start your learning journey?</h2>
        <Link to="/courses" className="explore-btn">Explore Courses</Link>
      </section>
    </div>
  );
}