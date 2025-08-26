import CardBox from './ui/CardBox';
import { motion } from 'framer-motion'; 
import {
  PenLine,
  FileTextIcon,
  Trash,
  Users,
  ArrowRightCircle,
} from 'lucide-react';

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20, delay: 0.2 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.4, duration: 0.5 },
  },
};

export const FeaturesSidebar = () => {
  return (
    <motion.div
      className="flex flex-col items-start justify-center p-4 sm:p-6 xl:p-10 w-full h-full xl:overflow-y-auto"
      variants={sidebarVariants} 
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col items-start gap-4 xl:gap-6 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* CardBox components are no longer wrapped in individual motion.divs */}
        <CardBox
          title={'Your space to write, express, and connect.'}
          icon={PenLine}
          content={'Build, manage, and grow your personal blog with ease.'}
        />
        <CardBox
          title={'Create & Share Posts'}
          icon={FileTextIcon}
          content={'Your space to write, express and connect.'}
        />
        <CardBox
          title={'Edit or Delete Anytime'}
          icon={Trash}
          content={
            "Easily update your content or remove posts whenever you like you're in full control."
          }
        />
        <CardBox
          title={'Manage Users & Role'}
          icon={Users}
          content={
            'Different roles for admins, writers, and readers ensure secure and flexible content management.'
          }
        />
        <CardBox
          title={'Get Started Now'}
          icon={ArrowRightCircle}
          content={
            'Log in to your account to start creating and managing your blogs today.'
          }
        />
      </motion.div>
    </motion.div>
  );
};

export default FeaturesSidebar;