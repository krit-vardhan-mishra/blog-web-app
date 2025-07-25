import { FileText, Info, Mail, MapPin, MessageCircle, Phone, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CardBox from '../CardBox';
import StaticCardBox from '../StaticCardBox';

const contentMap = {
  about: {
    title: 'About Us',
    icon: Info,
    content: 'BlogSphere is your platform to share, learn, and grow in the world of technology. We believe in fostering a community where passionate writers and readers come together to explore innovative ideas, share knowledge, and inspire each other. Our mission is to create a space where technology enthusiasts can connect, learn, and contribute to the ever-evolving digital landscape.',
    additionalInfo: 'Founded by developers, for developers, we strive to maintain the highest standards of content quality while ensuring an inclusive and welcoming environment for all.'
  },
  contact: {
    title: 'Contact',
    icon: MessageCircle,
    content: 'We\'d love to hear from you! Whether you have questions, suggestions, or just want to say hello, don\'t hesitate to reach out.',
    contactDetails: [
      { icon: Mail, label: 'Email', value: 'contact@blogsphere.com' },
      { icon: MapPin, label: 'Location', value: 'Platform 9¾, Wizarding World' },
      { icon: Phone, label: 'Phone', value: '+007 (616) 123-4567' }
    ],
    additionalInfo: 'Our team typically responds within 24 hours. For urgent matters, please use our priority support channel.'
  },
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    content: 'We respect your privacy and ensure your data is protected and never misused. Your personal information is encrypted and stored securely using industry-standard protocols.',
    keyPoints: [
      'We never sell your personal data to third parties',
      'All data is encrypted both in transit and at rest',
      'You have full control over your data and can request deletion at any time',
      'We use cookies only for essential functionality and analytics',
      'Regular security audits ensure your information stays protected'
    ],
    additionalInfo: 'Last updated: January 2025. We may update this policy periodically and will notify users of any significant changes.'
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    content: 'By using BlogSphere, you agree to our terms outlined here for your safety and ours. These terms ensure a positive experience for all community members.',
    keyPoints: [
      'Users must be respectful and constructive in all interactions',
      'Original content is encouraged; proper attribution required for references',
      'Spam, harassment, or malicious content will result in account suspension',
      'We reserve the right to moderate content to maintain quality standards',
      'Users retain ownership of their original content while granting us licensing rights'
    ],
    additionalInfo: 'These terms are effective immediately and govern your use of our platform. Continued use constitutes acceptance of any updates.'
  },
};

const StaticInfoModal = ({ activeCard, onClose }) => {
  if (!activeCard) return null;

  const { title, content, icon: Icon, additionalInfo, keyPoints, contactDetails } = contentMap[activeCard];

  return (
    <AnimatePresence>
      {activeCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-red-600 hover:text-red-400 z-10"
              >
                <X className="h-5 w-5 m-2" />
              </button>
              <StaticCardBox
                title={title}
                icon={<Icon className="h-6 w-6 text-blue-600" />}
                content={content}
                additionalInfo={additionalInfo}
                keyPoints={keyPoints}
                contactDetails={contactDetails}
              />

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StaticInfoModal;
