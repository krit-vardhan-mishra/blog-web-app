export const MODAL_CONFIGS = {
    createPost: {
        title: 'Create Post',
        documentTitle: 'Create Post',
    },
    editPost: {
        title: 'Edit Post',
        documentTitle: 'Edit Post',
    },
    viewPost: {
        documentTitle: 'View Post',
    },
    confirmDelete: {
        title: 'Confirm Delete',
        content: 'Are you sure you want to delete this post?',
    }
};

export const DEFAULT_BLOG_PROPS = {
    title: '',
    content: '',
    genre: 'All',
    tags: [],
    readingDifficulty: 'intermediate',
};

export const extractBlogProps = (blog) => {
    if (!blog) return DEFAULT_BLOG_PROPS;

    return {
        title: blog.title || '',
        content: blog.content || '',
        genre: blog.genre || 'All',
        tags: blog.tags || [],
        readingDifficulty: blog.readingDifficulty || 'intermediate',
        blogId: blog.id || blog._id,
    };
};

export const getModalProps = (modalType, data = {}) => {
    switch (modalType) {
        case 'create':
            return {
                ...MODAL_CONFIGS.createPost,
                ...data
            };

        case 'edit':
            return {
                ...MODAL_CONFIGS.editPost,
                ...extractBlogProps(data.blog),
                userId: data.userId,
                token: data.token,
                ...data
            };

        case 'view':
            return {
                ...MODAL_CONFIGS.viewPost,
                blog: data.blog,
                userId: data.userId,
                token: data.token,
                ...data
            };

        case 'delete':
            return {
                ...MODAL_CONFIGS.confirmDelete,
                ...data
            };

        default:
            return {};
    }
};

export const createModalHandlers = (updateState) => ({
    openCreateModal: () => updateState({ isCreatePostOpen: true }),
    closeCreateModal: () => updateState({ isCreatePostOpen: false }),

    openEditModal: (blog) => updateState({
        isEditPostOpen: true,
        blogToEdit: blog
    }),
    closeEditModal: () => updateState({
        isEditPostOpen: false,
        blogToEdit: null
    }),

    openPostModal: (blog) => updateState({
        isPostModalOpen: true,
        selectedBlogForModal: blog
    }),
    closePostModal: () => updateState({
        isPostModalOpen: false,
        selectedBlogForModal: null
    }),

    openDeleteModal: (blogId) => updateState({
        isConfirmOpen: true,
        selectedBlogId: blogId
    }),
    closeDeleteModal: () => updateState({
        isConfirmOpen: false,
        selectedBlogId: null
    }),

    openStatsModal: (stat) => updateState({
        isStatModalOpen: true,
        selectedStat: stat
    }),
    closeStatsModal: () => updateState({
        isStatModalOpen: false,
        selectedStat: null
    }),

    openAllStatsModal: () => updateState({ isAllStatsOpen: true }),
    closeAllStatsModal: () => updateState({ isAllStatsOpen: false }),
});

export const createNotificationHandlers = (updateState) => ({
    showNotification: (message, type = 'success') => updateState({
        notificationMessage: message,
        showNotificationBanner: true,
        notificationType: type
    }),

    hideNotification: () => updateState({
        showNotificationBanner: false,
        notificationMessage: '',
        notificationType: null
    }),

    showWelcome: () => updateState({ showWelcomeBanner: true }),
    hideWelcome: () => updateState({ showWelcomeBanner: false }),
});

export const updateDocumentTitle = (modalStates, selectedItems, defaultTitle) => {
    const { isEditPostOpen, isCreatePostOpen, isPostModalOpen } = modalStates;
    const { selectedBlogForModal } = selectedItems;

    if (isEditPostOpen) {
        document.title = 'Edit Post';
    } else if (isCreatePostOpen) {
        document.title = 'Create Post';
    } else if (isPostModalOpen) {
        document.title = selectedBlogForModal?.title || 'View Post';
    } else {
        document.title = defaultTitle;
    }
};

export const createSuccessHandlers = (updateState, updateTime, fetchData) => ({
    handlePostCreationSuccess: (message) => {
        updateState({
            notificationMessage: message,
            showNotificationBanner: true,
            isCreatePostOpen: false
        });
        updateTime();
        fetchData();
    },

    handlePostUpdateSuccess: (message) => {
        updateState({
            notificationMessage: message,
            showNotificationBanner: true,
            isEditPostOpen: false
        });
        updateTime();
        fetchData();
    },

    handlePostDeleteSuccess: async (blogId, deleteFunction) => {
        try {
            await deleteFunction(blogId);
            updateState(prev => ({
                allBlogs: prev.allBlogs.filter((b) => b._id !== blogId),
                notificationMessage: 'Post moved to trash successfully!',
                showNotificationBanner: true
            }));
            updateTime();
        } catch (error) {
            console.error('Failed to move blog to trash:', error);
            updateState({
                notificationMessage: 'Failed to move the post to trash.',
                showNotificationBanner: true
            });
        }
    }
});

export const ANIMATION_VARIANTS = {
    container: {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
            },
        },
    },

    item: {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    },

    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },

    slideUp: {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    }
};

export const COLOR_MAPPINGS = {
    stats: {
        'Your Blogs': 'text-blue-400',
        'Total Views': 'text-green-400',
        'Last Updated': 'text-purple-400',
    },

    genres: {
        'All': 'bg-gray-500',
        'Lifestyle': 'bg-pink-500',
        'Business': 'bg-blue-500',
        'Entertainment': 'bg-purple-500',
        'Science': 'bg-green-500',
        'Art': 'bg-orange-500',
        'Sports': 'bg-red-500',
        'Technology': 'bg-cyan-500',
        'Health': 'bg-emerald-500',
        'Travel': 'bg-indigo-500',
        'Food': 'bg-yellow-500',
        'Education': 'bg-teal-500',
        'Love & Relationships': 'bg-rose-500',
        'Poetry': 'bg-fuchsia-500',
        'Cinema': 'bg-violet-500',
        'Film Reviews': 'bg-purple-400',
        'Music': 'bg-pink-400',
        'Theatre': 'bg-indigo-400',
        'Photography': 'bg-amber-500',
        'Dance': 'bg-red-400',
        'Comics & Graphic Novels': 'bg-yellow-600',
        'Fiction': 'bg-sky-600',
        'Non-Fiction': 'bg-blue-600',
        'Short Stories': 'bg-blue-400',
        'Book Reviews': 'bg-lime-500',
        'Writing Tips': 'bg-green-400',
        'Creative Writing': 'bg-teal-400',
        'Culture & Traditions': 'bg-orange-400',
        'History': 'bg-stone-500',
        'Philosophy': 'bg-neutral-600',
        'Politics': 'bg-red-600',
        'Feminism': 'bg-pink-600',
        'Spirituality': 'bg-indigo-600',
        'Mindfulness': 'bg-green-600',
        'Minimalism': 'bg-slate-500',
        'Motivational': 'bg-lime-600',
        'Productivity': 'bg-cyan-600',
        'Life Lessons': 'bg-emerald-600',
        'Freelancing': 'bg-blue-300',
        'Career Advice': 'bg-gray-400',
        'Job Search': 'bg-amber-400',
        'Workplace Culture': 'bg-zinc-500',
        'Remote Work': 'bg-cyan-300',
        'Startup Life': 'bg-teal-300',
        'AI & Machine Learning': 'bg-fuchsia-600',
        'Coding & Development': 'bg-purple-600',
        'Gadgets & Reviews': 'bg-orange-600',
        'Cybersecurity': 'bg-red-700',
        'Blockchain & Crypto': 'bg-yellow-700',
        'Adventure': 'bg-green-700',
        'Backpacking': 'bg-amber-600',
        'Digital Nomad Life': 'bg-indigo-700',
        'Local Guides': 'bg-blue-700',
        'Cultural Exchange': 'bg-emerald-700',
        'Parenting': 'bg-pink-300',
        'Mental Health': 'bg-rose-400',
        'Self-Improvement': 'bg-lime-400',
        'Personal Journals': 'bg-gray-600'
    },

    difficulty: {
        'beginner': 'text-green-400 bg-green-900/30',
        'intermediate': 'text-yellow-400 bg-yellow-900/30',
        'advanced': 'text-red-400 bg-red-900/30',
        'default': 'text-gray-400 bg-gray-900/30'
    }
};