import { useState } from 'react';
import { CreatePostSkeleton } from '../skeleton/component/CreatePostSkeleton';
import useAuth from '../hooks/useAuth';
import blogService from '../api/blogService';
import GenreSelector from './GenreSelector';
import { Tags, BookOpen, Target, Plus, X, Save, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CreatePost = ({ onPostSuccess, isLoading = false }) => {
  const { user, token } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('All');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [readingDifficulty, setReadingDifficulty] = useState('intermediate');
  const [isCreating, setIsCreating] = useState(false);

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', icon: '🟢', description: 'Easy to read for everyone' },
    { value: 'intermediate', label: 'Intermediate', icon: '🟡', description: 'Moderate reading level' },
    { value: 'advanced', label: 'Advanced', icon: '🔴', description: 'Complex topics and language' }
  ];

  // Form validation
  const isTitleValid = title.trim().length > 0;
  const isContentValid = content.trim().length >= 5;
  const isFormValid = isTitleValid && isContentValid;

  const getRequiredFields = () => {
    const required = [];
    if (!isTitleValid) required.push('Title');
    if (!isContentValid) required.push('Content (minimum 5 characters)');
    return required;
  };

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

  const postBlog = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    if (!isFormValid) {
      onPostSuccess('Please fill all required fields');
      setIsCreating(false);
      return;
    }

    try {
      const response = await blogService.create({
        title: title.trim(),
        content: content.trim(),
        genre,
        tags,
        readingDifficulty
      });

      if (response) {
        onPostSuccess('Blog Created Successfully!');
        setTitle('');
        setContent('');
        setGenre('All');
        setTags([]);
        setReadingDifficulty('intermediate');
      } else {
        throw new Error('No response received from server');
      }
    } catch (err) {
      console.error('Create failed:', err);
      onPostSuccess(
        err.message || 'Failed to create blog - please try again'
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <CreatePostSkeleton />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold flex items-center">
            <Save className="mr-3 w-8 h-8" />
            Create New Post
          </h2>
          <p className="text-gray-400 mt-2">Share your thoughts with the world!</p>
        </div>

        <form onSubmit={postBlog} className="space-y-8">
          {/* Two Column Layout for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block mb-3 text-lg font-medium">
                  Post Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full p-4 bg-gray-800 border rounded-lg focus:outline-none transition-all duration-200 text-white text-lg ${
                    isTitleValid 
                      ? 'border-gray-600 focus:border-blue-500' 
                      : 'border-red-500 focus:border-red-400'
                  }`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isCreating}
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
                <label className="block mb-3 text-lg font-medium">Genre</label>
                <GenreSelector
                  selectedGenre={genre}
                  onGenreChange={setGenre}
                  disabled={isCreating}
                />
              </div>

              {/* Reading Difficulty */}
              <div>
                <label className="flex items-center mb-3 text-lg font-medium">
                  <Target className="mr-2 w-5 h-5" />
                  Reading Difficulty
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {difficultyOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`
                        flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200
                        ${readingDifficulty === option.value
                          ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-750'
                        }
                        ${isCreating ? 'cursor-not-allowed opacity-50' : ''}
                      `}
                    >
                      <input
                        type="radio"
                        name="readingDifficulty"
                        value={option.value}
                        checked={readingDifficulty === option.value}
                        onChange={(e) => setReadingDifficulty(e.target.value)}
                        disabled={isCreating}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-4">{option.icon}</span>
                      <div>
                        <div className="font-medium text-lg">{option.label}</div>
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
                <label className="flex items-center mb-3 text-lg font-medium">
                  <Tags className="mr-2 w-5 h-5" />
                  Tags (Optional)
                </label>

                <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem] p-3 bg-gray-800 border border-gray-600 rounded-lg">
                  {tags.length === 0 ? (
                    <span className="text-gray-500 text-sm">No tags added yet</span>
                  ) : (
                    tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          disabled={isCreating}
                          className="ml-2 hover:text-red-300 transition-colors duration-200"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    placeholder="Add tags to help categorize your post"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    disabled={isCreating || tags.length >= 10}
                    maxLength={30}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={isCreating || !tagInput.trim() || tags.length >= 10}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {tags.length}/10 tags • Press Enter or click Add to add tags
                </div>
              </div>

              {/* Content Input */}
              <div className="flex-1">
                <label className="flex items-center mb-3 text-lg font-medium">
                  <BookOpen className="mr-2 w-5 h-5" />
                  Post Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={12}
                  className={`w-full p-4 bg-gray-800 border rounded-lg focus:outline-none transition-all duration-200 text-white resize-none ${
                    isContentValid 
                      ? 'border-gray-600 focus:border-blue-500' 
                      : 'border-red-500 focus:border-red-400'
                  }`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isCreating}
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
          <div className="border-t border-gray-700 pt-6">
            {/* Required Fields Status */}
            <div className="mb-4">
              {getRequiredFields().length > 0 ? (
                <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-400 font-medium mb-2">Required to Create Post:</h4>
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
                <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-400 rounded-full mr-2 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-green-400 font-medium">Ready to post! All requirements met.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                <span className="text-red-400">*</span> Required fields
              </div>
              
              <Button
                type="submit"
                className={`px-8 py-4 rounded-lg transition-all duration-200 font-medium text-lg flex items-center ${
                  isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 cursor-not-allowed text-gray-300'
                }`}
                disabled={!isFormValid || isCreating}
              >
                {isCreating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Post...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    Create Post
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;