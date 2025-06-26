import { motion } from "framer-motion";

const FormGroup = ({ id, label, value, onChange, error, type = "text" }) => (
  <div className="grid grid-cols-4 gap-4 items-center">
    <label htmlFor={id} className="col-span-1 text-white hover:scale-110 transition-transform duration-200">
      <b>{label}</b>
    </label>
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="col-span-3 w-full">
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
        placeholder={`Enter your ${label.toLowerCase().replace(":", "")}`}
        required
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </motion.div>
  </div>
);

export default FormGroup;
