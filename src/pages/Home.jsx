import { useEffect, useRef, useState } from 'react';
import {Link} from 'react-router-dom';

const PremiumCard = ({ image, title, subtitle, badge, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      // className={`group relative overflow-hidden rounded-3xl cursor-pointer animate-fade-in-up`}
      // style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient border effect */}
      <div className="absolute "></div>

      {/* Main card container */}
      <div className="relative bg-white rounded-3xl ">
        {/* Image container with parallax */}
        <div className="relative ">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover "
           
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0"></div>

          {/* Animated shine effect */}
         

          {/* Badge */}
         

          {/* Content overlay */}
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <div className="transform transition-all duration-500 ">
             

              {/* CTA Button */}
             
            </div>
          </div>

          {/* Floating particles */}
          
        </div>

        {/* Bottom feature highlights */}
        
      </div>
    </div>
  );
};

const FloatingPhone3D = () => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    resize();
    window.addEventListener('resize', resize);

    let animFrame;
    let time = 0;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width / dpr,
      y: Math.random() * canvas.height / dpr,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    }));

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      
      ctx.clearRect(0, 0, w, h);
      
      // Animated gradient background
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      const pulse = Math.sin(time * 0.001) * 0.05;
      gradient.addColorStop(0, `rgba(79, 70, 229, ${0.15 + pulse})`);
      gradient.addColorStop(0.5, `rgba(147, 51, 234, ${0.2 + pulse})`);
      gradient.addColorStop(1, `rgba(59, 130, 246, ${0.15 + pulse})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Geometric grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let i = 0; i < w; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }

      // Particles with glow
      particles.forEach(p => {
        const glowSize = p.size * 3;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        gradient.addColorStop(0, `rgba(96, 165, 250, ${p.opacity * 0.8})`);
        gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
        
        p.x += p.speedX + Math.sin(time * 0.001) * 0.3;
        p.y += p.speedY + Math.cos(time * 0.001) * 0.3;
        
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      });

      // 3D Phone mockup
      const centerX = w * 0.5 + mousePos.x * 30;
      const centerY = h * 0.5 + mousePos.y * 30;
      const phoneW = Math.min(200, w * 0.3);
      const phoneH = phoneW * 2;
      
      const float = Math.sin(time * 0.002) * 20;
      const rotate = Math.sin(time * 0.0015) * 0.1;

      ctx.save();
      ctx.translate(centerX, centerY + float);
      ctx.rotate(rotate + mousePos.x * 0.1);
      
      // Shadow with blur
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, phoneH / 2 + 30, phoneW * 0.7, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Phone body layers for depth
      for (let i = 3; i >= 0; i--) {
        const offset = i * 2;
        const alpha = 0.1 + (3 - i) * 0.1;
        
        ctx.fillStyle = `rgba(31, 41, 55, ${alpha})`;
        roundRect(ctx, -phoneW/2 - offset, -phoneH/2 - offset, phoneW + offset * 2, phoneH + offset * 2, 22);
        ctx.fill();
      }

      // Main phone body
      const phoneGradient = ctx.createLinearGradient(-phoneW/2, -phoneH/2, phoneW/2, phoneH/2);
      phoneGradient.addColorStop(0, '#1f2937');
      phoneGradient.addColorStop(0.3, '#374151');
      phoneGradient.addColorStop(0.7, '#1f2937');
      phoneGradient.addColorStop(1, '#111827');
      
      ctx.fillStyle = phoneGradient;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 4;
      roundRect(ctx, -phoneW/2, -phoneH/2, phoneW, phoneH, 20);
      ctx.fill();
      
      // Glowing border
      ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
      ctx.shadowBlur = 25;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Screen with gradient
      const screenGradient = ctx.createLinearGradient(-phoneW/2 + 15, -phoneH/2 + 15, phoneW/2 - 15, phoneH/2 - 15);
      const screenPulse = Math.sin(time * 0.002) * 0.1;
      screenGradient.addColorStop(0, `rgba(79, 70, 229, ${0.9 + screenPulse})`);
      screenGradient.addColorStop(0.3, `rgba(124, 58, 237, ${1})`);
      screenGradient.addColorStop(0.7, `rgba(147, 51, 234, ${0.95})`);
      screenGradient.addColorStop(1, `rgba(37, 99, 235, ${0.9 + screenPulse})`);
      
      ctx.fillStyle = screenGradient;
      roundRect(ctx, -phoneW/2 + 15, -phoneH/2 + 15, phoneW - 30, phoneH - 30, 15);
      ctx.fill();

      // Screen reflection
      const reflectionGradient = ctx.createLinearGradient(-phoneW/2 + 15, -phoneH/2 + 15, -phoneW/2 + 15, -phoneH/2 + 100);
      reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = reflectionGradient;
      roundRect(ctx, -phoneW/2 + 20, -phoneH/2 + 20, phoneW - 40, 80, 12);
      ctx.fill();

      // Notch
      ctx.fillStyle = '#111827';
      roundRect(ctx, -phoneW/4, -phoneH/2 + 20, phoneW/2, 25, 12);
      ctx.fill();

      // Camera lens
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(-phoneW/6, -phoneH/2 + 32, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dynamic UI elements on screen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = `bold ${phoneW * 0.09}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Your Design', 0, -phoneH/2 + 80);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `${phoneW * 0.065}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillText('Custom Mobile Cover', 0, -phoneH/2 + 105);

      // Animated UI cards
      for (let i = 0; i < 3; i++) {
        const yPos = -phoneH/2 + 140 + i * 70;
        const pulse = Math.sin(time * 0.003 + i * 0.5) * 0.15 + 0.85;
        const cardWidth = phoneW - 70;
        
        // Card background
        const cardGradient = ctx.createLinearGradient(-cardWidth/2, yPos, cardWidth/2, yPos + 50);
        cardGradient.addColorStop(0, `rgba(255, 255, 255, ${0.15 * pulse})`);
        cardGradient.addColorStop(1, `rgba(255, 255, 255, ${0.08 * pulse})`);
        
        ctx.fillStyle = cardGradient;
        roundRect(ctx, -cardWidth/2, yPos, cardWidth, 50, 10);
        ctx.fill();
        
        // Card border
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Animated icon circle
        const iconSize = 30;
        const iconX = -cardWidth/2 + 25;
        const iconGradient = ctx.createRadialGradient(iconX, yPos + 25, 0, iconX, yPos + 25, iconSize/2);
        iconGradient.addColorStop(0, `rgba(96, 165, 250, ${0.4 * pulse})`);
        iconGradient.addColorStop(1, `rgba(96, 165, 250, ${0.1 * pulse})`);
        
        ctx.fillStyle = iconGradient;
        ctx.beginPath();
        ctx.arc(iconX, yPos + 25, iconSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Progress bar
        const barWidth = cardWidth - 80;
        const progress = ((Math.sin(time * 0.002 + i) + 1) / 2) * barWidth;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, -cardWidth/2 + 50, yPos + 35, barWidth, 4, 2);
        ctx.fill();
        
        const progressGradient = ctx.createLinearGradient(-cardWidth/2 + 50, yPos + 35, -cardWidth/2 + 50 + progress, yPos + 35);
        progressGradient.addColorStop(0, 'rgba(96, 165, 250, 0.8)');
        progressGradient.addColorStop(1, 'rgba(147, 51, 234, 0.8)');
        
        ctx.fillStyle = progressGradient;
        roundRect(ctx, -cardWidth/2 + 50, yPos + 35, progress, 4, 2);
        ctx.fill();
      }

      // Button at bottom
      const btnY = phoneH/2 - 80;
      const btnWidth = phoneW - 60;
      const btnGradient = ctx.createLinearGradient(-btnWidth/2, btnY, btnWidth/2, btnY + 45);
      btnGradient.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
      btnGradient.addColorStop(1, 'rgba(245, 158, 11, 0.9)');
      
      ctx.fillStyle = btnGradient;
      roundRect(ctx, -btnWidth/2, btnY, btnWidth, 45, 12);
      ctx.fill();
      
      ctx.fillStyle = '#78350f';
      ctx.font = `bold ${phoneW * 0.07}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillText('Design Now', 0, btnY + 30);

      ctx.restore();
      
      time += 16;
      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, [mousePos]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePos({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className="w-full h-full cursor-move"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

const roundRect = (ctx, x, y, w, h, r) => {
  if (w <= 0 || h <= 0) {
    ctx.rect(x, y, Math.max(0, w), Math.max(0, h));
    return;
  }
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

function PremiumCardSection() {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-purple-50/30 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with animation */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text text-sm font-bold uppercase tracking-wider">
              Choose Your Style
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Two Ways to Get Your
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text">
              Perfect Mobile Cover
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose from thousands of pre-designed themes or create your own custom phone case with our easy-to-use design tool
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent to-purple-600 rounded-full"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <div className="h-1 w-20 bg-gradient-to-l from-transparent to-purple-600 rounded-full"></div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <a href="/themes">
            <PremiumCard
              image="https://res.cloudinary.com/dwmytphop/image/upload/v1766311084/main_background_theame_ni9f5a.png"
              title="Pre-Designed Themes"
              subtitle="Explore 1000+ professionally crafted designs across anime, sports, nature, and abstract categories"
              badge="🎨 1000+ Designs"
              delay={0}
            />
          </a>
          
          <a href="/customizer">
          
            <PremiumCard
            image="https://res.cloudinary.com/dwmytphop/image/upload/v1766311082/Customised_theam_ghg4jm.png"
            title="Custom Design"
            subtitle="Upload your photos and create a one-of-a-kind mobile cover with our advanced design editor"
            badge="✨ Your Photos"
            delay={200}
          />
          </a>
        </div>

        {/* Bottom features strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in animation-delay-800">
          {[
            { icon: '🎯', text: 'Perfect Fit', desc: 'All Models' },
            { icon: '⚡', text: 'Quick Print', desc: '24-48 Hours' },
            { icon: '🛡️', text: 'Durable', desc: 'Long Lasting' },
            { icon: '🚚', text: 'Fast Ship', desc: 'India Wide' }
          ].map((feature, i) => (
            <div 
              key={i}
              className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <div className="font-bold text-gray-900 mb-1">{feature.text}</div>
              <div className="text-sm text-gray-600">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}

// Demo component
function PremiumHero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <section className="relative text-white py-20 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-block">
                <span className="bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-yellow-400/30 animate-pulse-slow">
                  ✨ Premium Quality Guaranteed
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="inline-block animate-slide-in-left bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  Create Custom
                </span>
                <br />
                <span className="inline-block animate-slide-in-left animation-delay-200 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
                  Mobile Covers
                </span>
                <br />
                <span className="block text-yellow-300 animate-slide-in-left animation-delay-400 drop-shadow-2xl">
                  Starting at ₹199
                </span>
              </h1>
              
              <p className="text-xl text-white/90 max-w-lg animate-fade-in animation-delay-600 leading-relaxed">
                Design personalized phone cases with your photos. Premium quality printing for all phone models. Fast delivery across India.
              </p>
              
             <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-800">

  {/* Design Your Cover */}
  <a
    href="/customizer"
    className="group inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transform"
  >
    <span>Design Your Cover</span>
    <svg
      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  </a>

  {/* Browse Designs */}
  <a
    href="/products"
    className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-105 transform"
  >
    Browse Designs
  </a>

  {/* WhatsApp */}
 <a
  href="https://wa.me/7827205492?text=Hi%20%F0%9F%91%8B%20CoverGhar%20Team%2C%0A%0AI%20want%20to%20design%20a%20custom%20mobile%20cover.%0APlease%20guide%20me%20with%20designs%2C%20price%20%26%20delivery%20details%20%F0%9F%98%8A"
  target="_blank"
  rel="noopener noreferrer"
  className="group inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-105 transform"
>
  <svg
    className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
  </svg>
  WhatsApp
</a>



</div>


              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 pt-6 animate-fade-in animation-delay-1000">
                {[
                  { icon: '🛡️', text: 'Premium Quality', color: 'from-blue-500 to-cyan-500' },
                  { icon: '🚚', text: 'Fast Delivery', color: 'from-purple-500 to-pink-500' },
                  { icon: '⭐', text: '4.8/5 Rating', color: 'from-yellow-500 to-orange-500' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl backdrop-blur-sm group-hover:scale-110 transition-all shadow-lg`}>
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - 3D Canvas */}
            {/* <FloatingPhone3D /> */}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
            <path d="M0 120L60 112.5C120 105 240 90 360 82.5C480 75 600 75 720 78.75C840 82.5 960 90 1080 93.75C1200 97.5 1320 97.5 1380 97.5L1440 97.5V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      <PremiumCardSection />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .animate-blob { animation: blob 7s infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default PremiumHero;
