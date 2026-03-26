import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import './GallerySwiper.css'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'

type Props = {
  images: string[]
  initialIndex?: number
  onClose?: () => void
}

export default function GallerySwiper({ images, initialIndex = 0, onClose }: Props) {
  const [thumbs, setThumbs] = useState<any>(null)
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex)
  const [slidesPerView, setSlidesPerView] = useState<number>(7)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection on double-click (detail > 1)
    if (e.detail > 1) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  useEffect(() => {
    console.log('GallerySwiper initialized with images:', images, 'initialIndex:', initialIndex)
  }, [images])
  
  useEffect(() => {
    const update = () => {
      const isPortrait = window.innerHeight > window.innerWidth
      setSlidesPerView(isPortrait ? 4 : 7)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!images || images.length === 0) return null

  return (
    <Dialog fullScreen open onClose={onClose} PaperProps={{ style: { background: 'rgba(0,0,0,0.85)' } }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ userSelect: 'none' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }} />
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon sx={{ color: '#fff' }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent
        sx={{ padding: 2, height: '100vh', boxSizing: 'border-box', overflow: 'hidden', userSelect: 'none' }}
        onMouseDown={handleMouseDown}
        onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <div style={{height: '70vh', width: '100%', padding: 10}}>
            <Swiper
                modules={[Navigation, Thumbs, Keyboard]}
                initialSlide={initialIndex}
                navigation
                keyboard
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                thumbs={{ swiper: thumbs }}
                className="gs-main-swiper"
            >
            {images.map((src, i) => (
                <SwiperSlide key={i}>
                  <img src={src} alt={`image-${i}`} className="gs-main-img" draggable={false} onMouseDown={(ev)=>{ if ((ev as any).detail>1) ev.preventDefault(); }} />
                </SwiperSlide>
            ))}
            </Swiper>
        </div>
        <div style={{height: '30vh', width: '100%'}}>
            <Swiper
                modules={[Thumbs, Navigation]}
                navigation
                onSwiper={setThumbs}
                direction="horizontal"
                spaceBetween={10}
                slidesPerView={slidesPerView}
                className="gs-thumbs-swiper"
                watchSlidesProgress
            >
            {images.map((src, i) => (
                <SwiperSlide key={i} className={i === activeIndex ? 'gs-thumb-active' : ''}>
                  <img src={src} alt={`thumb-${i}`} className="gs-thumb-img" draggable={false} onMouseDown={(ev)=>{ if ((ev as any).detail>1) ev.preventDefault(); }} />
                </SwiperSlide>
            ))}
            </Swiper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
