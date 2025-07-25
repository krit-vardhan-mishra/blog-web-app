import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import blogService from '../api/blogService';
import Header from '../components/Header';
import { Eye, ArrowLeft, Calendar, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/utilityFunctions';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { parseEmojisEnhanced } from '../utils/emojiParser';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import EditPostModal from '../components/ui/modals/EditPostModal';
import NotifyBanner from '../components/ui/NotifyBanner';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

const BlogDetail = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasIncrementedRef = useRef(false);

  const isAuthor = user?.id && blog?.author?._id === user.id;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const result = await blogService.fetchById(blogId);
        setBlog(result);
      } catch (err) {
        console.error(err);
        setError('Failed to load blog post');
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  useEffect(() => {
    if (blog?.title) {
      document.title = `${blog.title}`;
    }
  }, [blog]);

  useEffect(() => {
    let timer;

    if (blog && blog.id && !hasIncrementedRef.current) {
      timer = setTimeout(() => {
        blogService.incrementView(blog.id)
          .then(() => {
            hasIncrementedRef.current = true;
          })
          .catch((err) =>
            console.error('Failed to increment blog view:', err)
          );
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [blog]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleUpdateSuccess = (message) => {
    setNotification({
      message: message || 'Blog updated successfully!',
      type: 'success',
    });
    setIsEditModalOpen(false);
    
    // Refresh the blog data
    const fetchUpdatedBlog = async () => {
      try {
        const result = await blogService.fetchById(blogId);
        setBlog(result);
      } catch (err) {
        console.error('Failed to refresh blog data:', err);
      }
    };
    
    fetchUpdatedBlog();
  };

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setIsConfirmDeleteOpen(false);
    
    try {
      await blogService.delete(blogId);
      setNotification({
        message: 'Blog moved to trash successfully!',
        type: 'success',
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error('Failed to delete blog:', err);
      setNotification({
        message: 'Failed to delete blog. Please try again.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white">
        <Header title="Blog" icons={[{ icon: ArrowLeft, link: -1 }]} />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2 text-red-500">
              Blog Not Found
            </h2>
            <p className="text-gray-400">
              We couldn't find the blog post you're looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white">
        <Header
          title="Blog"
          isLoading={true}
          icons={[{ icon: ArrowLeft, link: -1 }]} />
        <div className="max-w-4xl mx-auto p-6 animate-pulse">
          <div className="bg-gray-800/50 rounded-lg p-6 h-96"></div>
        </div>
      </div>
    );
  }

  const { title, content, author, views, createdAt } = blog;

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      <Header title="Blog" icons={[{ icon: ArrowLeft, link: -1 }]}
        customElements={[
          !isAuthenticated && (
            <div className="flex gap-3" key="auth-buttons">
              <Button
                type="login"
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                type="signup"
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                onClick={() => navigate('/signup')}
              >
                Signup
              </Button>
            </div>
          ),
        ]} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 mb-6 transition-all duration-300 hover:shadow-lg hover:border-blue-900 relative">
          {/* Author Action Buttons */}
          {isAuthor && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                onClick={handleEdit}
                disabled={isDeleting}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-110 text-white transition-all duration-200 flex items-center justify-center"
                aria-label="Edit Post"
              >
                <Edit size={18} />
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 rounded-full bg-red-600 hover:bg-red-700 hover:scale-110 text-white transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete Post"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          )}

          <h1 className={`text-3xl font-bold mb-2 text-white hover:text-orange-300 transition-colors duration-300 ${isAuthor ? 'pr-24' : ''}`}>
            {title}
          </h1>
          
          <div className="flex flex-wrap text-sm mb-4 space-x-4">
            <span className="flex items-center space-x-1 hover:text-indigo-300 text-indigo-100 transition-colors duration-200">
              <Calendar size={16} />
              <span>{formatDate(createdAt)}</span>
            </span>
            <span className="flex items-center space-x-1 hover:text-teal-300 text-teal-100 transition-colors duration-200">
              <Eye size={16} />
              <span>{views || 0} views</span>
            </span>
            {author?.name && (
              <span
                className="flex items-center space-x-1 cursor-pointer hover:text-blue-300 text-blue-100 transition-colors duration-200"
                onClick={() => navigate(`/user/${author._id || author.id}`)}
              >
                <UserIcon size={16} />
                <span>{author.name}</span>
              </span>
            )}
          </div>
          
          <SimpleBar className='border-t-white/10 border-t-2 border-b-white/10 border-b-2' style={{ maxHeight: '70vh' }}>
            <div className="text-gray-300 whitespace-pre-line text-base leading-relaxed">
              {content.split(/(\s+)/).map((part, index) => {
                if (/^\s+$/.test(part)) {
                  return part;
                }
                return (
                  <span
                    key={index}
                    className="inline-block transition-all duration-200 ease-out hover:scale-110 hover:text-white hover:font-medium hover:bg-gray-700/30 hover:px-1 hover:rounded cursor-pointer hover:shadow-lg"
                  >
                    <div
                      className="text-gray-300 whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: parseEmojisEnhanced(part) }}
                    />
                  </span>
                );
              })}
            </div>
          </SimpleBar>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditPostModal
          key={`edit-${blogId}`}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdateSuccess={handleUpdateSuccess}
          blogId={blogId}
          title={title}
          content={content}
          token={token}
          userId={user?.id}
        />
      )}

      {/* Notification */}
      {notification && (
        <NotifyBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default BlogDetail;