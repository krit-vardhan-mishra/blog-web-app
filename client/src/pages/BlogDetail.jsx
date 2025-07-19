import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import blogService from '../api/blogService';
import Header from '../components/Header';
import { Eye, ArrowLeft, Calendar, User as UserIcon } from 'lucide-react';
import { formatDate } from '../utils/utilityFunctions';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const BlogDetail = () => {
    const { blogId } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [error, setError] = useState(null);

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
            document.title = `${blog.title} - Blog`;
        }
    }, [blog]);

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f0f23] text-white">
                <Header
                    title="Blog"
                    icons={[{ icon: ArrowLeft, link: -1 }]}
                />
                <div className="max-w-4xl mx-auto p-6">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold mb-2 text-red-500">Blog Not Found</h2>
                        <p className="text-gray-400">We couldn't find the blog post you're looking for.</p>
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
                    icons={[{ icon: ArrowLeft, link: -1 }]}
                />
                <div className="max-w-4xl mx-auto p-6 animate-pulse">
                    <div className="bg-gray-800/50 rounded-lg p-6 h-96"></div>
                </div>
            </div>
        );
    }

    const { title, content, author, views, createdAt } = blog;

    return (
        <div className="min-h-screen bg-[#0f0f23] text-white">
            <Header
                title="Blog"
                icons={[{ icon: ArrowLeft, link: -1 }]}
            />
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 mb-6 transition-all duration-300 hover:shadow-lg hover:border-blue-900">
                    <h1 className="text-3xl font-bold mb-2 text-white hover:text-orange-300 transition-colors duration-300">
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
                    <SimpleBar style={{ maxHeight: '70vh' }}>
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
                                        {part}
                                    </span>
                                );
                            })}
                        </div>
                    </SimpleBar>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;