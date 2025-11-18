import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TorusKnot } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Assuming you use react-router

const Hero3D = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 25 }}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Suspense fallback={null}>
        <TorusKnot args={[3, 0.8, 256, 24]} scale={1}>
          <meshStandardMaterial color="#007BFF" wireframe />
        </TorusKnot>
      </Suspense>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
    </Canvas>
  );
};

const FeatureCard = ({ icon, title, children, delay }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay },
    },
  };

  return (
    <motion.div
      className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-gray-200/20 shadow-lg"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <div className="text-4xl mb-4 text-blue-400">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-300">{children}</p>
    </motion.div>
  );
};

const LandingPage = () => {
  const textVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Hero3D />
        </div>
        <div className="relative z-10 text-center p-4">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-4 text-shadow"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            Revolutionizing Medical Stock
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200 mb-8"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            style={{ transitionDelay: '0.3s' }}
          >
            Seamlessly manage your medical inventory with cutting-edge technology. Real-time tracking, smart analytics, and effortless ordering.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            <Link
              to="/products" // Link to your existing HomePage
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105"
            >
              Explore Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why Choose Us?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon="📦" title="Real-Time Inventory" delay={0.1}>
              Sync your stock from anywhere. Our system provides live updates to prevent shortages and overstocking.
            </FeatureCard>
            <FeatureCard icon="📈" title="Smart Analytics" delay={0.3}>
              Gain insights into your sales patterns, product performance, and expiry dates with our powerful analytics dashboard.
            </FeatureCard>
            <FeatureCard icon="🛒" title="Effortless Ordering" delay={0.5}>
              Create and manage orders with just a few clicks. Integrated with suppliers for a seamless procurement process.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-blue-600 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Join us and take control of your medical supply chain today.
          </p>
          <Link
            to="/products"
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105"
          >
            View Live Stock
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Medical Stock Management. All Rights Reserved.</p>
      </footer>

      <style jsx>{`
        .text-shadow {
          text-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;