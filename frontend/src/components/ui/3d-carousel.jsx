// import React, { memo, useEffect, useLayoutEffect, useState } from 'react';
// import {
//   AnimatePresence,
//   motion,
//   useAnimation,
//   useMotionValue,
// } from 'framer-motion';

// /* ---------- Utils ---------- */

// const useIsomorphicLayoutEffect =
//   typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// function useMediaQuery(query) {
//   const [matches, setMatches] = useState(false);

//   useIsomorphicLayoutEffect(() => {
//     const media = window.matchMedia(query);
//     setMatches(media.matches);
//     const listener = () => setMatches(media.matches);
//     media.addEventListener('change', listener);
//     return () => media.removeEventListener('change', listener);
//   }, [query]);

//   return matches;
// }

// /* ---------- Carousel ---------- */

// const Carousel = memo(function Carousel({ images, isActive, controls, onSelect }) {
//   const isMobile = useMediaQuery('(max-width: 640px)');
//   const cylinderWidth = isMobile ? 720 : 1100;
//   const faceCount = images.length;
//   const faceWidth = cylinderWidth / faceCount;
//   // Slightly smaller radius so the ring stays comfortably within the view
//   const radius = cylinderWidth / (2 * Math.PI * 1.2);

//   const rotation = useMotionValue(0);

//   return (
//     <div
//       style={{
//         display: 'flex',
//         // center the ring on the cross axis so it rotates around a fixed midpoint
//         alignItems: 'center',
//         justifyContent: 'center',
//         perspective: '1000px',
//         perspectiveOrigin: '50% 50%',
//       }}
//     >
//       <motion.div
//         drag={isActive ? 'x' : false}
//         style={{
//           width: cylinderWidth,
//           position: 'relative',
//           transformOrigin: 'center center',
//           transformStyle: 'preserve-3d',
//           cursor: 'grab',
//           rotateY: rotation,
//         }}
//         onDrag={(_, info) =>
//           isActive && rotation.set(rotation.get() + info.offset.x * 0.05)
//         }
//         onDragEnd={() => {}}
//         animate={controls}
//       >
//         {images.map((img, i) => (
//           <motion.div
//             key={i}
//             style={{
//               position: 'absolute',
//               padding: '0.5rem',
//               width: faceWidth,
//               transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
//             }}
//             onClick={() => onSelect(img)}
//           >
//             <img
//               src={img}
//               alt=""
//               style={{
//                 width: '100%',
//                 aspectRatio: '3 / 4',
//                 borderRadius: '0.75rem',
//                 objectFit: 'cover',
//                 boxShadow: '0 20px 40px rgba(0,0,0,0.65)',
//               }}
//             />
//           </motion.div>
//         ))}
//       </motion.div>
//     </div>
//   );
// });

// /* ---------- Component ---------- */

// export function ThreeDPhotoCarousel() {
//   const [images, setImages] = useState([]);
//   const [activeImg, setActiveImg] = useState(null);
//   const [isActive, setIsActive] = useState(true);
//   const controls = useAnimation();

//   useEffect(() => {
//     fetch('https://api.tvmaze.com/shows?page=0')
//       .then((res) => res.json())
//       .then((data) => {
//         const imgs = data
//           .filter((s) => s.image && s.image.original)
//           .slice(0, 20)
//           .map((s) => s.image.original);
//         setImages(imgs);
//       })
//       .catch(console.error);
//   }, []);

//   const handleSelect = (img) => {
//     setActiveImg(img);
//     setIsActive(false);
//     controls.stop();
//   };

//   const handleClose = () => {
//     setActiveImg(null);
//     setIsActive(true);
//   };

//   if (!images.length) return null;

//   return (
//     <>
//       <div
//         style={{
//           position: 'relative',
//           minHeight: '520px',
//           height: 'auto',
//           width: '100%',
//         }}
//       >
//         <Carousel
//           images={images}
//           isActive={isActive}
//           controls={controls}
//           onSelect={handleSelect}
//         />
//       </div>

//       <AnimatePresence>
//         {activeImg && (
//           <motion.div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={handleClose}
//           >
//             <motion.img
//               src={activeImg}
//               className="max-h-[90vh] rounded-2xl shadow-2xl"
//               initial={{ scale: 0.6 }}
//               animate={{ scale: 1 }}
//               transition={{ duration: 0.4 }}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
} from "framer-motion"

/* ---------- Utils ---------- */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

/* ---------- Carousel ---------- */

const Carousel = memo(function Carousel({
  images,
  isActive,
  controls,
  onSelect,
}) {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const cylinderWidth = isMobile ? 720 : 1100
  const faceCount = images.length
  const faceWidth = cylinderWidth / faceCount
  const radius = cylinderWidth / (2 * Math.PI)

  const rotation = useMotionValue(0)

  return (
    /* 🔒 FIXED 3D STAGE */
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "520px",
        perspective: "1200px",
        overflow: "hidden",
        border: "2px solid red", // DEBUG: make stage visible
        background: "rgba(255, 0, 0, 0.04)", // DEBUG: subtle tint
      }}
    >
      {/* DEBUG: label to confirm container size/position */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: "bold",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        CAROUSEL DEBUG
      </div>
      {/* 🔒 FIXED CENTER ANCHOR */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformStyle: "preserve-3d",
        }}
      >
        {/* 🔄 ROTATING CYLINDER */}
        <motion.div
          drag={isActive ? "x" : false}
          style={{
            width: cylinderWidth,
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transformOrigin: "50% 50%",
            rotateY: rotation,
            willChange: "transform",
            cursor: "grab",
          }}
          onDrag={(_, info) =>
            isActive &&
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }
          onDragEnd={(_, info) =>
            isActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.04,
              transition: {
                type: "spring",
                stiffness: 90,
                damping: 28,
              },
            })
          }
          animate={controls}
        >
          {images.map((img, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: faceWidth,
                transform: `
                  rotateY(${i * (360 / faceCount)}deg)
                  translateZ(${radius}px)
                  translate(-50%, -50%)
                `,
              }}
              onClick={() => onSelect(img)}
            >
              <img
                src={img}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "3 / 4",
                  borderRadius: "12px",
                  objectFit: "cover",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.65)",
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
})

/* ---------- Main Component ---------- */

export function ThreeDPhotoCarousel() {
  const [images, setImages] = useState([])
  const [activeImg, setActiveImg] = useState(null)
  const [isActive, setIsActive] = useState(true)
  const controls = useAnimation()

  useEffect(() => {
    fetch("https://api.tvmaze.com/shows?page=0")
      .then((res) => res.json())
      .then((data) => {
        const imgs = data
          .filter((s) => s.image && s.image.original)
          .slice(0, 20)
          .map((s) => s.image.original)
        setImages(imgs)
      })
      .catch(console.error)
  }, [])

  const handleSelect = (img) => {
    setActiveImg(img)
    setIsActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveImg(null)
    setIsActive(true)
  }

  // Fallback images so the carousel is always visible even before TVMaze loads
  const fallbackImages = [
    'https://images.pexels.com/photos/799137/pexels-photo-799137.jpeg', // city night
    'https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg', // skyline
    'https://images.pexels.com/photos/34088/pexels-photo.jpg',          // alley
    'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg', // bridge
    'https://images.pexels.com/photos/904272/pexels-photo-904272.jpeg', // neon street
    'https://images.pexels.com/photos/3035998/pexels-photo-3035998.jpeg',
  ]

  const effectiveImages = images.length ? images : fallbackImages

  return (
    <>
      <Carousel
        images={effectiveImages}
        isActive={isActive}
        controls={controls}
        onSelect={handleSelect}
      />

      <AnimatePresence>
        {activeImg && (
          <motion.div
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.img
              src={activeImg}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                maxHeight: "90vh",
                borderRadius: "16px",
                boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
