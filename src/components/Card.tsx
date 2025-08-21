"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { StaticImageData } from "next/image";

const Card = ({ phrase, image }: CardProps) => {
  return (
    <motion.div
      className="relative rounded-lg overflow-hidden w-[330px] md:w-[600px] h-[300px]"
      variants={cardVariants}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.5 }}
    >
      <div className="relative rounded-lg overflow-hidden w-[330px] md:w-[600px] h-[300px]">
        <Image src={image} alt={phrase} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="break-keep absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 text-white text-lg font-bold text-center z-20 drop-shadow-lg">
          {phrase}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;

type CardProps = {
  phrase: string;
  image: StaticImageData;
};

const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};
