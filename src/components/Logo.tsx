/**
 * 🖼️ LOGO COMPONENT - FULL UPDATE
 * Componente de logo robusto com fallbacks
 */

import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ 
  width = 180, 
  height = 180, 
  className = "", 
  showText = false 
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    console.warn('❌ Erro ao carregar logo, usando fallback');
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Logo carregado com sucesso');
    setImageLoaded(true);
  };

  // Fallback SVG logo
  const FallbackLogo = () => (
    <div 
      className={`flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg ${className}`}
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="text-white font-bold text-2xl mb-1">⚽</div>
        <div className="text-white font-bold text-lg">ODD</div>
        <div className="text-white font-bold text-lg">GENIUS</div>
        <div className="text-white text-xs mt-1">FOOTY STATS</div>
      </div>
    </div>
  );

  if (imageError) {
    return <FallbackLogo />;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-sm">Carregando...</div>
        </div>
      )}
      
      {/* Main logo image */}
      <Image
        src="/logo.png"
        alt="Odd Genius Footy Stats Logo"
        width={width}
        height={height}
        className={`object-contain max-w-full transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority
      />
      
      {/* Optional text */}
      {showText && imageLoaded && !imageError && (
        <div className="text-center mt-2">
          <div className="text-sm font-bold text-gray-800">Odd Genius</div>
          <div className="text-xs text-gray-600">Footy Stats</div>
        </div>
      )}
    </div>
  );
}

/**
 * 🖼️ SIDEBAR LOGO - Versão específica para sidebar
 */
export function SidebarLogo() {
  return (
    <div className="flex items-center justify-center px-4 py-8">
      <Logo 
        width={180} 
        height={180} 
        className="drop-shadow-lg hover:scale-105 transition-transform duration-300" 
      />
    </div>
  );
}

/**
 * 🖼️ HEADER LOGO - Versão específica para header
 */
export function HeaderLogo() {
  return (
    <div className="flex items-center gap-3">
      <Logo 
        width={40} 
        height={40} 
        className="drop-shadow-md" 
      />
      <div className="hidden md:block">
        <div className="text-lg font-bold text-gray-900">Odd Genius</div>
        <div className="text-xs text-gray-600">Footy Stats</div>
      </div>
    </div>
  );
}
