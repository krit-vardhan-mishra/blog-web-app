import { Facebook, Twitter, Instagram, Github, NotebookPen } from "lucide-react";
import FooterSkeleton from '../skeleton/component/FooterSkeleton';
import { useState } from "react";
import StaticInfoModal from '../components/ui/modals/StaticInfoModal';

export const Footer = ({ isLoading = false }) => {
  const [activeCard, setActiveCard] = useState(null);

  const handleOpen = (section) => setActiveCard(section);
  const handleClose = () => setActiveCard(null);

  if (isLoading) return <FooterSkeleton />;

  return (
    <>
      <footer className="bg-[#1e1e2f] text-white py-8 px-4 mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div>
            <h2 className="flex text-xl font-bold mb-2">
              <NotebookPen className="me-2" /><a href="/home">BlogSphere</a>
            </h2>
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
              <a href="https://www.facebook.com/kritvardhan.mishra/" target="_blank" rel="noreferrer">
                <Facebook className="w-5 h-5 hover:text-blue-500" />
              </a>
              <a href="https://x.com/imkritvm/" target="_blank" rel="noreferrer">
                <Twitter className="w-5 h-5 hover:text-gray-700" />
              </a>
              <a href="https://www.instagram.com/imkritvm/" target="_blank" rel="noreferrer">
                <Instagram className="w-5 h-5 hover:text-pink-500" />
              </a>
              <a href="https://github.com/krit-vardhan-mishra/" target="_blank" rel="noreferrer">
                <Github className="w-5 h-5 hover:text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mt-6 border-t border-gray-700 pt-4">
          &copy; {new Date().getFullYear()} BlogSphere. All rights reserved.
        </div>
      </footer>

      {/* Card Modal */}
      <StaticInfoModal activeCard={activeCard} onClose={handleClose} />
    </>
  );
};

export default Footer;
