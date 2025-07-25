import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis()

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return null
}

export default SmoothScroll
