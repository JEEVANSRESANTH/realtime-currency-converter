import { motion } from "framer-motion";

const GlassCard = ({
  children,
  className = "",
  hover = true,
  glow = false,
  delay = 0,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`glass rounded-2xl p-6 ${
        hover ? "card-hover" : ""
      } ${glow ? "hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
