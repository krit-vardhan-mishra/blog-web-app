import React, { createContext, useContext, useRef, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

const LenisContext = createContext(null);

export const useLenis = () => useContext(LenisContext);

export const LenisProvider = ({ children, wrapper }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      wrapper: wrapper || window,
    });
    lenisRef.current = lenis;
    window.lenisInstance = lenis;

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete window.lenisInstance;
    };
  }, [wrapper]); 
  
  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
};