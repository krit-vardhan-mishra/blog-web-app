const StaticCardBox = ({ title, icon, content, additionalInfo, keyPoints, contactDetails }) => {
  return (
    <div className="bg-[#2A2E36] text-white p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex items-center space-x-2">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <p className="">{content}</p>

      {keyPoints && (
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          {keyPoints.map((point, index) => (
            <li className="hover:text-gray-50" key={index}>{point}</li>
          ))}
        </ul>
      )}

      {contactDetails && (
        <div className="space-y-2">
          {contactDetails.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <item.icon className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{item.label}:</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {additionalInfo && (
        <p className="text-sm text-gray-400 italic">{additionalInfo}</p>
      )}
    </div>
  );
};

export default StaticCardBox;