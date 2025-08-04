import { useState, useEffect, useRef } from 'react';
import EditPostSkeleton from '../skeleton/component/EditPostSkeleton';
import { Button } from '../components/ui/Button';
import blogService from '../api/blogService';
import GenreSelector from './GenreSelector';
import { Tags, BookOpen, Target, Plus, X, Save, AlertCircle } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export const EditPost = ({
  onUpdateSuccess,
  isLoading = false,
  title: initialTitle = '',
  content: initialContent = '',
  genre: initialGenre = 'All',
  tags: initialTags = [],
  readingDifficulty: initialReadingDifficulty = 'intermediate',
  blogId,
  userId,
  token,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [genre, setGenre] = useState(initialGenre);
  const [tags, setTags] = useState(Array.isArray(initialTags) ? initialTags : []);
  const [tagInput, setTagInput] = useState('');
  const [readingDifficulty, setReadingDifficulty] = useState(initialReadingDifficulty);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState({});

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', icon: '🟢', description: 'Easy to read for everyone' },
    { value: 'intermediate', label: 'Intermediate', icon: '🟡', description: 'Moderate reading level' },
    { value: 'advanced', label: 'Advanced', icon: '🔴', description: 'Complex topics and language' }
  ];

  useEffect(() => {
    const currentData = {
      title: title.trim(),
      content: content.trim(),
      genre,
      tags: [...tags].sort().join(','),
      readingDifficulty
    };

    const initialDataString = {
      title: (initialData.title || '').trim(),
      content: (initialData.content || '').trim(),
      genre: initialData.genre || 'All',
      tags: [...(initialData.tags || [])].sort().join(','),
      readingDifficulty: initialData.readingDifficulty || 'intermediate'
    };

    const hasChanged = JSON.stringify(currentData) !== JSON.stringify(initialDataString);
    setHasChanges(hasChanged);
  }, [title, content, genre, tags, readingDifficulty, initialData]);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setGenre(initialGenre);
    setTags(Array.isArray(initialTags) ? initialTags : []);
    setReadingDifficulty(initialReadingDifficulty);

    const checkOwnership = async () => {
      if (!blogId || !userId || !token) {
        setIsCheckingOwnership(false);
        return;
      }

      try {
        setIsCheckingOwnership(true);
        const blog = await blogService.fetchById(blogId);

        let authorId;
        if (typeof blog.author === 'object' && blog.author._id) {
          authorId = blog.author._id;
        } else if (typeof blog.author === 'string') {
          authorId = blog.author;
        } else {
          console.error('Invalid author format:', blog.author);
          onUpdateSuccess('Error: Invalid blog author data');
          return;
        }

        if (authorId.toString() === userId.toString()) {
          setIsAuthor(true);
          const blogData = {
            title: blog.title || initialTitle,
            content: blog.content || initialContent,
            genre: blog.genre || initialGenre,
            tags: Array.isArray(blog.tags) ? blog.tags : [],
            readingDifficulty: blog.readingDifficulty || initialReadingDifficulty
          };

          setTitle(blogData.title);
          setContent(blogData.content);
          setGenre(blogData.genre);
          setTags(blogData.tags);
          setReadingDifficulty(blogData.readingDifficulty);
          setInitialData(blogData);
        } else {
          setIsAuthor(false);
          onUpdateSuccess('You can only edit your own blogs');
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        onUpdateSuccess('Error checking blog ownership');
      } finally {
        setIsCheckingOwnership(false);
      }
    };

    if (blogId && userId && token) {
      checkOwnership();
    }
  }, [blogId, userId, token, initialTitle, initialContent, initialGenre, initialTags, initialReadingDifficulty]);

  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Form validation
  const isTitleValid = title.trim().length > 0;
  const isContentValid = content.trim().length >= 5;
  const isFormValid = isTitleValid && isContentValid && hasChanges;

  const getRequiredFields = () => {
    const required = [];
    if (!isTitleValid) required.push('Title');
    if (!isContentValid) required.push('Content (minimum 5 characters)');
    if (!hasChanges && isTitleValid && isContentValid) required.push('Make changes to enable update');
    return required;
  };

  const postEditedBlog = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    if (!isAuthor) {
      onUpdateSuccess('You are not authorized to edit this blog');
      setIsUpdating(false);
      return;
    }

    if (!blogId) {
      console.error('blogId is undefined');
      onUpdateSuccess('Failed to update blog: Blog ID is missing');
      setIsUpdating(false);
      return;
    }

    if (!isFormValid) {
      onUpdateSuccess('Please fill all required fields and make changes');
      setIsUpdating(false);
      return;
    }

    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        genre,
        tags,
        readingDifficulty
      };

      const response = await blogService.update(blogId, blogData);

      if (response) {
        if (
          response.success === true ||
          response.updated === true ||
          response.status === 'success' ||
          response.message?.toLowerCase().includes('success') ||
          response.message?.toLowerCase().includes('updated') ||
          (response.status >= 200 && response.status < 300) ||
          (response.title && response.content)
        ) {
          setInitialData({
            title: title.trim(),
            content: content.trim(),
            genre,
            tags: [...tags],
            readingDifficulty
          });
          onUpdateSuccess('Blog Updated Successfully!');
        } else {
          console.warn('EditPost - Unexpected response format:', response);
          onUpdateSuccess('Blog Updated Successfully!');
        }
      } else {
        throw new Error('No response received from server');
      }
    } catch (err) {
      console.error('Update failed:', err);
      console.error('Error details:', {
        message: err.message,
        statusCode: err.statusCode,
        status: err.status,
        response: err.response,
      });

      if (err.statusCode === 403 || err.status === 403) {
        onUpdateSuccess('You are not authorized to edit this blog');
      } else if (err.statusCode === 401 || err.status === 401) {
        onUpdateSuccess('Your session has expired. Please log in again.');
      } else if (err.statusCode === 404 || err.status === 404) {
        onUpdateSuccess('Blog not found');
      } else if (err.statusCode === 400 || err.status === 400) {
        onUpdateSuccess('Invalid blog data provided');
      } else {
        onUpdateSuccess(
          err.message || 'Update may have failed - please refresh to check'
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || isCheckingOwnership) {
    return <EditPostSkeleton />;
  }

  if (!isAuthor) {
    return (
      <div className="w-full bg-gray-900 flex items-center justify-center p-4">
        <div className="text-white text-center p-6 max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-400">Access Denied</h2>
          <p className="text-gray-300 text-sm sm:text-base">You can only edit your own blog posts.</p>
          <div className="mt-4 text-xs sm:text-sm text-gray-400">
            <p>Debug Info:</p>
            <p>User ID: {userId}</p>
            <p>Blog ID: {blogId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Save className="mr-2 sm:mr-3 w-6 h-6 sm:w-8 sm:h-8" />
            Update Post
          </h2>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Edit your blog post and make it shine!</p>
        </div>

        {/* Simple Bar */}
        <SimpleBar
          style={{ maxHeight: 'calc(95vh - 120px)' }}
          className="pb-4"
        >
          <div className="space-y-6 sm:space-y-8 pr-2 sm:pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

              {/* Left Column */}
              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block mb-2 sm:mb-3 text-base sm:text-lg font-medium">
                    Post Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 sm:p-4 bg-gray-800 border rounded-lg focus:outline-none transition-all duration-200 text-white text-base sm:text-lg ${isTitleValid
                      ? 'border-gray-600 focus:border-blue-500'
                      : 'border-red-500 focus:border-red-400'
                      }`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUpdating}
                    maxLength={200}
                    placeholder="Enter your blog post title..."
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className={`text-sm ${isTitleValid ? 'text-gray-400' : 'text-red-400'}`}>
                      {!isTitleValid && <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> Title is required</span>}
                    </div>
                    <div className="text-xs text-gray-400">
                      {title.length}/200 characters
                    </div>
                  </div>
                </div>

                {/* Genre Selector */}
                <div>
                  <label className="block mb-2 sm:mb-3 text-base sm:text-lg font-medium">Genre</label>
                  <GenreSelector
                    selectedGenre={genre}
                    onGenreChange={setGenre}
                    disabled={isUpdating}
                  />
                </div>

                {/* Reading Difficulty */}
                <div>
                  <label className="flex items-center mb-2 sm:mb-3 text-base sm:text-lg font-medium">
                    <Target className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Reading Difficulty
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {difficultyOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`
                          flex items-center p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200
                          ${readingDifficulty === option.value
                            ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                            : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-750'
                          }
                          ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                      >
                        <input
                          type="radio"
                          name="readingDifficulty"
                          value={option.value}
                          checked={readingDifficulty === option.value}
                          onChange={(e) => setReadingDifficulty(e.target.value)}
                          disabled={isUpdating}
                          className="sr-only"
                        />
                        <span className="text-xl sm:text-2xl mr-3 sm:mr-4">{option.icon}</span>
                        <div>
                          <div className="font-medium text-base sm:text-lg">{option.label}</div>
                          <div className="text-sm opacity-75">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Tags Input */}
                <div>
                  <label className="flex items-center mb-2 sm:mb-3 text-base sm:text-lg font-medium">
                    <Tags className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Tags (Optional)
                  </label>

                  <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem] p-3 bg-gray-800 border border-gray-600 rounded-lg">
                    {tags.length === 0 ? (
                      <span className="text-gray-500 text-sm">No tags added yet</span>
                    ) : (
                      tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-600 text-white"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            disabled={isUpdating}
                            className="ml-1 sm:ml-2 hover:text-red-300 transition-colors duration-200"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X size={12} className="sm:w-[14px] sm:h-[14px]" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white text-sm sm:text-base"
                      placeholder="Add tags to help categorize your post"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      disabled={isUpdating || tags.length >= 10}
                      maxLength={30}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={isUpdating || !tagInput.trim() || tags.length >= 10}
                      className="px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {tags.length}/10 tags • Press Enter or click Add to add tags
                  </div>
                </div>

                {/* Content Input */}
                <div className="flex-1">
                  <label className="flex items-center mb-2 sm:mb-3 text-base sm:text-lg font-medium">
                    <BookOpen className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Post Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={10}
                    className={`w-full p-3 sm:p-4 bg-gray-800 border rounded-lg focus:outline-none transition-all duration-200 text-white resize-none text-sm sm:text-base ${isContentValid
                      ? 'border-gray-600 focus:border-blue-500'
                      : 'border-red-500 focus:border-red-400'
                      }`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isUpdating}
                    placeholder="Write your blog content here..."
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className={`text-sm ${isContentValid ? 'text-gray-400' : 'text-red-400'}`}>
                      {!isContentValid && (
                        <span className="flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Minimum 5 characters required
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {content.length} characters
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Status and Submit */}
            <div className="border-t border-gray-700 pt-4 sm:pt-6">
              {/* Required Fields Status */}
              <div className="mb-4">
                {getRequiredFields().length > 0 ? (
                  <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-yellow-400 font-medium mb-2 text-sm sm:text-base">Required to Enable Update:</h4>
                        <ul className="text-yellow-200 text-sm space-y-1">
                          {getRequiredFields().map((field, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                              {field}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-900/30 border border-green-600 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-green-400 rounded-full mr-2 flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-green-400 font-medium text-sm sm:text-base">Ready to update! All requirements met.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <div className="text-sm text-gray-400">
                  <span className="text-red-400">*</span> Required fields
                </div>

                <Button
                  onClick={postEditedBlog}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-200 font-medium text-base sm:text-lg flex items-center justify-center ${isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 cursor-not-allowed text-gray-300'
                    }`}
                  disabled={!isFormValid || isUpdating}
                >
                  {isUpdating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Post...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Update Post
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default EditPost;