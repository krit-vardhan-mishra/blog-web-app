import { LogOut, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import HeaderSkeleton from '../skeleton/component/HeaderSkeleton';

export const Header = ({ title, icons = [], className, isLoading = false }) => {
    if (isLoading) {
        return <HeaderSkeleton />
    }

    return (
        <div
            className={clsx(
                'w-full h-[70px] bg-gray-800/80 backdrop-blur-md shadow-md flex items-center justify-between px-4 border-b border-gray-700',
                className)} >
            <h1 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold transition-transform duration-300">
                {title}
            </h1>
            <div className="flex items-center space-x-2 mr-[5px]">
                {icons.map(({ icon: Icon, link }, index) => (
                    <Link to={link} key={index}>
                        <div
                            className={clsx(
                                `group p-2 rounded-full transition duration-200 cursor-pointer`,
                                {
                                    'hover:bg-red-500/50': Icon === Trash2 && title != "Your Deleted Posts",
                                    'hover:bg-red-500/80': Icon === LogOut,
                                    'hover:bg-white/10': Icon !== Trash2 && Icon !== LogOut 
                                }
                            )}
                        >
                            <Icon className="text-white w-6 h-6 transform transition-transform duration-200 group-hover:scale-110" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Header;