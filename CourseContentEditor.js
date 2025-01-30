// src/components/courses/CourseContentEditor.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import { app } from '../../firebase/firebaseConfig';

export function CourseContentEditor() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const db = getDatabase(app);
      const courseRef = ref(db, `courses/${courseId}`);
      const modulesRef = ref(db, `courseModules/${courseId}`);

      try {
        const [courseSnapshot, modulesSnapshot] = await Promise.all([
          get(courseRef),
          get(modulesRef)
        ]);

        if (courseSnapshot.exists()) {
          setCourse(courseSnapshot.val());
        }

        if (modulesSnapshot.exists()) {
          const modulesData = modulesSnapshot.val();
          const modulesArray = Object.entries(modulesData).map(([id, module]) => ({
            id,
            ...module
          }));
          setModules(modulesArray);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleAddModule = () => {
    setModules(prev => [...prev, {
      id: `temp-${Date.now()}`,
      title: 'New Module',
      description: '',
      lessons: []
    }]);
  };

  const handleAddLesson = (moduleId) => {
    setModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: [
            ...(module.lessons || []),
            {
              id: `temp-${Date.now()}`,
              title: 'New Lesson',
              content: '',
              duration: '',
              type: 'video'
            }
          ]
        };
      }
      return module;
    }));
  };

  const handleModuleChange = (moduleId, field, value) => {
    setModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        return { ...module, [field]: value };
      }
      return module;
    }));
  };

  const handleLessonChange = (moduleId, lessonId, field, value) => {
    setModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        const updatedLessons = module.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return { ...lesson, [field]: value };
          }
          return lesson;
        });
        return { ...module, lessons: updatedLessons };
      }
      return module;
    }));
  };

  const handleSaveContent = async () => {
    setSaving(true);
    const db = getDatabase(app);
    const storage = getStorage(app);

    try {
      // Save modules and lessons
      const modulesRef = ref(db, `courseModules/${courseId}`);
      const modulesData = {};

      for (const module of modules) {
        const moduleId = module.id.startsWith('temp-') ? 
          push(ref(db, `courseModules/${courseId}`)).key : 
          module.id;

        const lessonsData = {};
        if (module.lessons) {
          for (const lesson of module.lessons) {
            const lessonId = lesson.id.startsWith('temp-') ?
              push(ref(db, `courseLessons/${courseId}/${moduleId}`)).key :
              lesson.id;

            // Handle file uploads for lessons
            let contentUrl = lesson.contentUrl;
            if (lesson.contentFile) {
              const fileRef = storageRef(storage, `course-content/${courseId}/${moduleId}/${lessonId}`);
              await uploadBytes(fileRef, lesson.contentFile);
              contentUrl = await getDownloadURL(fileRef);
            }

            lessonsData[lessonId] = {
              title: lesson.title,
              content: lesson.content,
              duration: lesson.duration,
              type: lesson.type,
              contentUrl
            };
          }
        }

        modulesData[moduleId] = {
          title: module.title,
          description: module.description,
          order: module.order,
          lessons: lessonsData
        };
      }

      await set(modulesRef, modulesData);

      // Update course with total lessons count
      const totalLessons = modules.reduce((acc, module) => 
        acc + (module.lessons ? module.lessons.length : 0), 0
      );

      await set(ref(db, `courses/${courseId}/totalLessons`), totalLessons);
      navigate(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Error saving course content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContentFileChange = async (moduleId, lessonId, file) => {
    setModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        const updatedLessons = module.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return { ...lesson, contentFile: file };
          }
          return lesson;
        });
        return { ...module, lessons: updatedLessons };
      }
      return module;
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Course Content: {course?.title}</h1>
        <button
          onClick={handleSaveContent}
          disabled={saving}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Modules</h2>
            <button
              onClick={handleAddModule}
              className="px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Add Module
            </button>
          </div>

          <div className="space-y-6">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="border rounded-lg p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => handleModuleChange(module.id, 'title', e.target.value)}
                    className="text-lg font-medium w-full border-gray-300 rounded-md"
                    placeholder="Module Title"
                  />
                  <textarea
                    value={module.description}
                    onChange={(e) => handleModuleChange(module.id, 'description', e.target.value)}
                    className="mt-2 w-full border-gray-300 rounded-md"
                    placeholder="Module Description"
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700">Lessons</h3>
                    <button
                      onClick={() => handleAddLesson(module.id)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Add Lesson
                    </button>
                  </div>

                  {module.lessons?.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="border rounded-md p-4">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(module.id, lesson.id, 'title', e.target.value)}
                        className="w-full border-gray-300 rounded-md"
                        placeholder="Lesson Title"
                      />
                      
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <select
                          value={lesson.type}
                          onChange={(e) => handleLessonChange(module.id, lesson.id, 'type', e.target.value)}
                          className="border-gray-300 rounded-md"
                        >
                          <option value="video">Video</option>
                          <option value="text">Text Content</option>
                          <option value="quiz">Quiz</option>
                        </select>

                        <input
                          type="text"
                          value={lesson.duration}
                          onChange={(e) => handleLessonChange(module.id, lesson.id, 'duration', e.target.value)}
                          className="border-gray-300 rounded-md"
                          placeholder="Duration (e.g., 10:00)"
                        />
                      </div>

                      {lesson.type === 'video' && (
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleContentFileChange(module.id, lesson.id, e.target.files[0])}
                            className="w-full"
                          />
                        </div>
                      )}

                      {lesson.type === 'text' && (
                        <textarea
                          value={lesson.content}
                          onChange={(e) => handleLessonChange(module.id, lesson.id, 'content', e.target.value)}
                          className="mt-2 w-full border-gray-300 rounded-md"
                          placeholder="Lesson Content"
                          rows={4}
                        />
                      )}

                      {lesson.type === 'quiz' && (
                        <div className="mt-2">
                          {/* Quiz editor component would go here */}
                          <p className="text-gray-500">Quiz editor coming soon...</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}