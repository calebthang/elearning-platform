// src/components/courses/CourseForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDatabase, ref, set, push, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import { app } from '../../firebase/firebaseConfig';

export function CourseForm() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'programming',
    level: 'beginner',
    price: '',
    duration: '',
    learningObjectives: [''],
    requirements: ['']
  });

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        const db = getDatabase(app);
        const courseRef = ref(db, `courses/${courseId}`);
        const snapshot = await get(courseRef);
        if (snapshot.exists()) {
          setFormData(snapshot.val());
        }
      };
      fetchCourse();
    }
  }, [courseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const db = getDatabase(app);
      const storage = getStorage(app);
      let thumbnailUrl = formData.thumbnail;

      if (thumbnailFile) {
        const fileRef = storageRef(storage, `course-thumbnails/${courseId || Date.now()}`);
        await uploadBytes(fileRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(fileRef);
      }

      const courseData = {
        ...formData,
        thumbnail: thumbnailUrl,
        instructorId: currentUser.uid,
        instructorName: currentUser.displayName,
        updatedAt: new Date().toISOString(),
        createdAt: courseId ? formData.createdAt : new Date().toISOString()
      };

      if (courseId) {
        await set(ref(db, `courses/${courseId}`), courseData);
      } else {
        const newCourseRef = push(ref(db, 'courses'));
        await set(newCourseRef, courseData);
      }

      navigate('/instructor/dashboard');
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {courseId ? 'Edit Course' : 'Create New Course'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  required
                  value={formData.level}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (e.g., "10 hours")
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                Course Thumbnail
              </label>
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives
              </label>
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleArrayInputChange(index, 'learningObjectives', e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('learningObjectives', index)}
                    className="px-2 py-1 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('learningObjectives')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500"
              >
                + Add Learning Objective
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleArrayInputChange(index, 'requirements', e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="px-2 py-1 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500"
              >
                + Add Requirement
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 text-right">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Saving...' : courseId ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}