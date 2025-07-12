import { motion } from "framer-motion";

export default function CardBox({title, content, icon: Icon, actionButton}) {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#2A2E36] text-white rounded-2xl py-3 px-4 xl:py-4 xl:px-6 shadow-log w-full
                       hover:border-white hover:border-2 transition-all duration-200 ease-in-out"
        >
            <div className="flex items-center gap-3 mb-3 xl:mb-4">
                {Icon && <Icon size={24} className="xl:w-7 xl:h-7" />}
                <h2 className="text-lg xl:text-xl font-semibold">{title}</h2>
            </div>
            <p className="text-gray-300 mb-3 xl:mb-4 text-sm xl:text-base">{content}</p>
            {actionButton && <div>{actionButton}</div>}
        </motion.div>
    );
}