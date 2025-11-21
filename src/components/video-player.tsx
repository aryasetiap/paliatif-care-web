'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Youtube } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

import { VideoData } from '@/lib/videoRecomendations'

interface VideoPlayerProps {
  videos: VideoData[]
  autoPlay?: boolean
  showPlaylist?: boolean
  className?: string
}

export default function VideoPlayer({
  videos,
  autoPlay = false,
  showPlaylist = true,
  className = ""
}: VideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentVideo = videos[currentVideoIndex]

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Generate embed URL
  const getEmbedUrl = (url: string, autoplay: boolean = false) => {
    const videoId = getYouTubeId(url)
    if (!videoId) return url
    return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=${autoplay ? 1 : 0}`
  }

  // Handle video controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // For YouTube embed, we need to reload with autoplay parameter
    if (videoRef.current) {
      const newSrc = getEmbedUrl(currentVideo.videoUrl, !isPlaying)
      videoRef.current.src = newSrc
    }
  }

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index)
    setIsPlaying(autoPlay)
    if (videoRef.current) {
      videoRef.current.src = getEmbedUrl(videos[index].videoUrl, autoPlay)
    }
  }

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showControls && isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => clearTimeout(timeout)
  }, [showControls, isPlaying])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (!videos.length) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-sky-200">
        <CardContent className="p-8 text-center">
          <Youtube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Video tidak tersedia untuk hasil ini</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Video Player */}
        <div className="lg:col-span-2">
          <Card className="bg-white/90 backdrop-blur-md border-sky-200 overflow-hidden">
            <CardContent className="p-0">
              <div
                ref={containerRef}
                className="relative aspect-video bg-black rounded-lg overflow-hidden group"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => isPlaying && setShowControls(false)}
              >
                {/* YouTube Embed */}
                <iframe
                  ref={videoRef}
                  src={getEmbedUrl(currentVideo.videoUrl, autoPlay)}
                  title={currentVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {/* Custom Controls Overlay */}
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePlayPause}
                        className="text-white hover:text-white hover:bg-white/20"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleVolumeToggle}
                        className="text-white hover:text-white hover:bg-white/20"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleFullscreen}
                      className="text-white hover:text-white hover:bg-white/20"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5" />
                      ) : (
                        <Maximize className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Video Title Overlay */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg">{currentVideo.title}</h3>
                </div>
              </div>

              {/* Video Description */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sky-900">{currentVideo.title}</h4>
                  <span className="text-sm text-sky-600">{currentVideo.duration}</span>
                </div>
                <p className="text-sky-700 text-sm leading-relaxed">{currentVideo.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Playlist */}
        {showPlaylist && videos.length > 1 && (
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-md border-sky-200 h-full">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sky-900 mb-4 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  Daftar Video (2)
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        variant={index === currentVideoIndex ? "default" : "ghost"}
                        onClick={() => handleVideoSelect(index)}
                        className={`w-full p-3 h-auto justify-start ${
                          index === currentVideoIndex
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'hover:bg-sky-50 text-sky-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative w-20 h-12 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={video.thumbnailUrl}
                              alt={video.title}
                              width={80}
                              height={48}
                              className="w-full h-full object-cover"
                              onError={() => {
                                // Fallback to YouTube thumbnail
                              }}
                            />
                            {index === currentVideoIndex && isPlaying && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                            <p className="text-xs opacity-75">{video.duration}</p>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}