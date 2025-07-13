import { Facebook, Twitter, Instagram, Github, NotebookPen } from "lucide-react";
import FooterSkeleton from '../skeleton/component/FooterSkeleton';
import { useState } from "react";
import { motion } from "framer-motion";
import { GlowCapture, Glow } from "@codaworks/react-glow";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import StaticInfoModal from '../components/ui/modals/StaticInfoModal';

export const Footer = ({ isLoading = false }) => {
  const [activeCard, setActiveCard] = useState(null);

  const handleOpen = (section) => setActiveCard(section);
  const handleClose = () => setActiveCard(null);

  if (isLoading) return <FooterSkeleton />;

  const logoVariants = {
    hover: {
      scale: 1.05,
      rotate: [0, -2, 2, 0],
      transition: {
        scale: { type: "spring", stiffness: 400, damping: 17 },
        rotate: { duration: 0.4, ease: "easeInOut" }
      }
    }
  };

  const iconVariants = {
    initial: {
      scale: 1,
      rotate: 0
    },
    hover: {
      scale: 1.2,
      rotate: [0, -10, 10, -5, 5, 0],
      transition: {
        scale: { type: "spring", stiffness: 400, damping: 17 },
        rotate: { duration: 0.6, ease: "easeInOut" }
      }
    },
    exit: {
      scale: 1,
      rotate: 0,
      transition: {
        scale: { type: "spring", stiffness: 400, damping: 17 },
        rotate: { duration: 0.3, ease: "easeInOut" }
      }
    }
  };

  return (
    <>
      <footer className="bg-[#1e1e2f] text-white py-8 px-4 mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div>
            <motion.div
              className="flex items-center gap-3"
              variants={logoVariants}
              whileHover="hover">
              <h2 className="flex text-xl font-bold mb-2">
                <NotebookPen className="me-2" /><a href="/home">BlogSphere</a>
              </h2>
            </motion.div>
            <p className="text-sm text-gray-300">
              A place to explore stories, tutorials, and ideas from tech enthusiasts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => handleOpen("about")} className="hover:text-white">About Us</button></li>
              <li><button onClick={() => handleOpen("contact")} className="hover:text-white">Contact</button></li>
              <li><button onClick={() => handleOpen("privacy")} className="hover:text-white">Privacy Policy</button></li>
              <li><button onClick={() => handleOpen("terms")} className="hover:text-white">Terms of Service</button></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
            <div className="flex space-x-4">
              <motion.a
                href="https://www.facebook.com/kritvardhan.mishra/"
                target="_blank" rel="noreferrer" variants={iconVariants}
                initial="initial" whileHover="hover"
                animate="initial" className="cursor-pointer">
                <Facebook className="w-5 h-5 hover:text-blue-500" />
              </motion.a>

              <motion.a
                href="https://x.com/imkritvm/"
                target="_blank" rel="noreferrer" variants={iconVariants}
                initial="initial" whileHover="hover"
                animate="initial" className="cursor-pointer">
                <Twitter className="w-5 h-5 hover:text-gray-700" />
              </motion.a>

              <motion.a
                href="https://www.instagram.com/imkritvm/"
                target="_blank" rel="noreferrer" variants={iconVariants}
                initial="initial" whileHover="hover"
                animate="initial" className="cursor-pointer">
                <Instagram className="w-5 h-5 hover:text-pink-500" />
              </motion.a>

              <motion.a
                href="https://github.com/krit-vardhan-mishra/"
                target="_blank" rel="noreferrer" variants={iconVariants}
                initial="initial" whileHover="hover"
                animate="initial" className="cursor-pointer">
                <Github className="w-5 h-5 hover:text-gray-400" />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mt-6 border-t border-gray-700 pt-4">
          &copy; {new Date().getFullYear()} BlogSphere. All rights reserved.
        </div>
        
        <div className='p-4 mt-auto flex items-center justify-center gap-2'>
          <p>Made with</p>
          <GlowCapture className="hover:scale-110">
            <Glow className='Glow: text-red-500 Glow:shadow-lg'>
              <FontAwesomeIcon icon={faHeart} className="text-red-500 heartbeat" />
            </Glow>
          </GlowCapture>
          <p>by <b>Krit</b></p>
        </div>

      </footer >

      {/* Card Modal */}
      < StaticInfoModal activeCard={activeCard} onClose={handleClose} />
    </>
  );
};

export default Footer;