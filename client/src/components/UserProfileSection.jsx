import React from 'react';
import { motion } from 'framer-motion';
import { UserIcon, Info } from 'lucide-react';

const UserProfileSection = ({ 
  greeting, 
  displayedUserName, 
  currentTime, 
  user,
  itemVariants 
}) => {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 shadow-lg mb-8 border border-gray-700"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">
            {greeting},{' '}
            <span className="text-blue-400">{displayedUserName}</span>!
          </h1>

          <p className="text-gray-400 mb-4">{currentTime}</p>

          <UserInfo user={user} />
          
          {user?.about && <AboutSection about={user.about} />}
        </div>
      </div>
    </motion.div>
  );
};

const UserInfo = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
    <div className="flex items-center space-x-2">
      <UserIcon size={16} className="text-blue-400" />
      <p>
        {user?.name || 'Loading Name...'}
        {user?.age && (
          <span className="ml-2">( Age: {user?.age || 'N/A'} )</span>
        )}
      </p>
    </div>
  </div>
);

const AboutSection = ({ about }) => (
  <div className="flex items-start text-gray-300 bg-[#1A1C20] rounded-lg p-4 mt-4">
    <div className="mr-2 mt-0.5 text-green-400 flex-shrink-0">
      <Info size={20} />
      <p className="text-green-400 font-mono text-sm ms-1 mt-3">
        &gt;
      </p>
    </div>
    <div>
      <p className="text-sm font-medium text-green-400 mb-1">About</p>
      <AboutContent about={about} />
    </div>
  </div>
);

const AboutContent = ({ about }) => (
  <div className="text-sm leading-relaxed whitespace-pre-line mt-3">
    {about.split('\n').map((line, index) => (
      <p key={index} className="about-line mb-2">
        <span className="text-green-400 font-mono mr-2">&gt;</span>
        {line
          .split(
            /(?<=[\u0900-\u097F])(?=[^\u0900-\u097F])|(?<=[^\u0900-\u097F])(?=[\u0900-\u097F])/g
          )
          .map((part, idx) => {
            const isDevanagari = /[\u0900-\u097F]/.test(part);
            const isEmpty = part.trim() === '';

            if (isEmpty) return <span key={idx}>{part}</span>;

            return part.split(/(\s+)/).map((word, wordIdx) => {
              if (word.trim() === '') return <span key={`${idx}-${wordIdx}`}>{word}</span>;

              return (
                <span
                  key={`${idx}-${wordIdx}`}
                  className={`hover-word no-underline ${isDevanagari ? 'devanagari-text' : 'english-text'}`}
                  style={{
                    marginRight: '0.2em',
                    display: 'inline-block',
                  }}
                >
                  {word}
                </span>
              );
            });
          })}
      </p>
    ))}
  </div>
);

export default UserProfileSection;