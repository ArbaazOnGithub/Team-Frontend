import { motion } from 'framer-motion';

const Skeleton = ({ className, variant = "rect" }) => {
    const variants = {
        rect: "rounded-lg",
        circle: "rounded-full",
        text: "rounded-md h-4 w-3/4"
    };

    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`bg-[#547792]/10 ${variants[variant]} ${className}`}
        />
    );
};

export default Skeleton;
