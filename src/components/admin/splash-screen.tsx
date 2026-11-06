'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setFadeOut(true), 300)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      onTransitionEnd={() => { if (fadeOut) setVisible(false) }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0E1B3D',
        transition: 'opacity 400ms ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: 'none',
      }}
    >
      <PulseMark />
      <Wordmark />
    </div>
  )
}

function PulseMark() {
  return (
    <div style={{ width: 96, height: 96, position: 'relative' }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Amber dot — bounces */}
        <circle cx="50" cy="16" r="9" fill="#D4933A">
          <animate
            attributeName="cy"
            values="16;10;16"
            dur="1.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
          <animate
            attributeName="r"
            values="9;7.5;9"
            dur="1.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        </circle>

        {/* A-shape legs */}
        <path
          d="M50 26 L30 60 L40 60 L46 50 L54 50 L60 60 L70 60 Z"
          fill="white"
        >
          <animate
            attributeName="opacity"
            values="1;0.7;1"
            dur="1.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        </path>

        {/* Pulse / ECG line */}
        <path
          d="M8 72 Q22 72 30 64 Q38 56 46 64 Q54 72 62 64 Q70 56 92 72"
          stroke="white"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="200;0;0"
            dur="1.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
          <animate
            attributeName="stroke-dasharray"
            values="0 200;200 0;200 0"
            dur="1.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
      </svg>
    </div>
  )
}

function Wordmark() {
  return (
    <div
      style={{
        marginTop: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span
        style={{
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '0.08em',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        SCHOOL PULSE
      </span>
      <span
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.12em',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        ADMIN CONSOLE
      </span>
    </div>
  )
}
