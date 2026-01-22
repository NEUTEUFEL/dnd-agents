import { useEffect, useState } from 'react';

interface PixelCharacterProps {
  agentId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  status: 'idle' | 'working' | 'moving' | 'completed' | 'blocked';
  direction: 'down' | 'up' | 'left' | 'right';
  onClick?: () => void;
  selected?: boolean;
}

// Unique character designs for each Big Bang Theory character
const CHARACTER_DESIGNS: Record<string, {
  hair: string;
  hairStyle: 'short' | 'tall' | 'bowl' | 'long' | 'ponytail' | 'wavy';
  skin: string;
  shirt: string;
  shirtStyle: 'tshirt' | 'hoodie' | 'turtleneck' | 'vest' | 'tank' | 'cardigan';
  pants: string;
  accessory?: 'glasses' | 'belt-buckle' | 'necklace' | 'bow';
}> = {
  sheldon: {
    hair: '#4a3728',
    hairStyle: 'short',
    skin: '#fdbcb4',
    shirt: '#2563eb', // Blue Flash shirt
    shirtStyle: 'tshirt',
    pants: '#854d0e',
    accessory: undefined,
  },
  leonard: {
    hair: '#3d2314',
    hairStyle: 'short',
    skin: '#fdbcb4',
    shirt: '#16a34a', // Green hoodie
    shirtStyle: 'hoodie',
    pants: '#1e3a5f',
    accessory: 'glasses',
  },
  howard: {
    hair: '#2d1b0e',
    hairStyle: 'bowl',
    skin: '#fdbcb4',
    shirt: '#dc2626', // Colorful turtleneck
    shirtStyle: 'turtleneck',
    pants: '#7c2d12',
    accessory: 'belt-buckle',
  },
  raj: {
    hair: '#1a1a1a',
    hairStyle: 'short',
    skin: '#c68642',
    shirt: '#7c3aed', // Purple sweater vest
    shirtStyle: 'vest',
    pants: '#374151',
    accessory: undefined,
  },
  penny: {
    hair: '#fbbf24',
    hairStyle: 'long',
    skin: '#fdbcb4',
    shirt: '#ec4899', // Pink casual top
    shirtStyle: 'tank',
    pants: '#1e40af',
    accessory: 'necklace',
  },
  amy: {
    hair: '#5c4033',
    hairStyle: 'wavy',
    skin: '#fdbcb4',
    shirt: '#059669', // Green cardigan
    shirtStyle: 'cardigan',
    pants: '#4b5563',
    accessory: 'glasses',
  },
};

export function PixelCharacter({
  agentId,
  name,
  x,
  y,
  status,
  direction,
  onClick,
  selected,
}: PixelCharacterProps) {
  const [frame, setFrame] = useState(0);
  const design = CHARACTER_DESIGNS[agentId] || CHARACTER_DESIGNS.sheldon;

  // Animation frame cycling
  useEffect(() => {
    if (status === 'moving' || status === 'working') {
      const interval = setInterval(() => {
        setFrame((f) => (f + 1) % 4);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setFrame(0);
    }
  }, [status]);

  const isWalking = status === 'moving';
  const bobOffset = isWalking ? (frame % 2 === 0 ? -2 : 0) : 0;
  const legOffset = isWalking ? (frame % 2 === 0 ? 2 : -2) : 0;

  return (
    <div
      onClick={onClick}
      className={`absolute transition-all duration-500 ease-linear cursor-pointer ${
        selected ? 'z-20' : 'z-10'
      }`}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* Selection ring */}
      {selected && (
        <div
          className="absolute -inset-2 rounded-full border-2 border-yellow-400 animate-pulse"
          style={{ bottom: -8 }}
        />
      )}

      {/* Shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/30 rounded-full"
        style={{ filter: 'blur(2px)' }}
      />

      {/* Character sprite */}
      <svg
        width="32"
        height="48"
        viewBox="0 0 32 48"
        className="pixelated"
        style={{
          transform: `translateY(${bobOffset}px) ${direction === 'left' ? 'scaleX(-1)' : ''}`,
          imageRendering: 'pixelated',
        }}
      >
        {/* Hair */}
        <HairSprite style={design.hairStyle} color={design.hair} />

        {/* Face */}
        <rect x="10" y="12" width="12" height="10" fill={design.skin} />

        {/* Eyes */}
        {design.accessory === 'glasses' ? (
          <>
            <rect x="11" y="15" width="4" height="3" fill="#374151" />
            <rect x="17" y="15" width="4" height="3" fill="#374151" />
            <rect x="12" y="16" width="2" height="2" fill="#1f2937" />
            <rect x="18" y="16" width="2" height="2" fill="#1f2937" />
            <rect x="15" y="16" width="2" height="1" fill="#374151" />
          </>
        ) : (
          <>
            <rect x="12" y="16" width="2" height="2" fill="#1f2937" />
            <rect x="18" y="16" width="2" height="2" fill="#1f2937" />
          </>
        )}

        {/* Mouth */}
        <rect x="14" y="19" width="4" height="1" fill="#b91c1c" />

        {/* Body/Shirt */}
        <ShirtSprite style={design.shirtStyle} color={design.shirt} />

        {/* Belt buckle for Howard */}
        {design.accessory === 'belt-buckle' && (
          <rect x="14" y="30" width="4" height="2" fill="#fbbf24" />
        )}

        {/* Necklace for Penny */}
        {design.accessory === 'necklace' && (
          <circle cx="16" cy="24" r="2" fill="#fbbf24" />
        )}

        {/* Legs */}
        <rect x="11" y="32" width="4" height="10" fill={design.pants} style={{ transform: `translateX(${legOffset}px)` }} />
        <rect x="17" y="32" width="4" height="10" fill={design.pants} style={{ transform: `translateX(${-legOffset}px)` }} />

        {/* Feet */}
        <rect x="10" y="42" width="5" height="3" fill="#1f2937" style={{ transform: `translateX(${legOffset}px)` }} />
        <rect x="17" y="42" width="5" height="3" fill="#1f2937" style={{ transform: `translateX(${-legOffset}px)` }} />

        {/* Working indicator */}
        {status === 'working' && (
          <g className="animate-bounce">
            <rect x="24" y="2" width="6" height="8" fill="#fbbf24" rx="1" />
            <text x="25" y="9" fontSize="6" fill="#1f2937">!</text>
          </g>
        )}
      </svg>

      {/* Name tag */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded">
          {name}
        </span>
      </div>

      {/* Status indicator */}
      <div
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-slate-800 ${
          status === 'working' ? 'bg-green-500 animate-pulse' : ''
        } ${status === 'idle' ? 'bg-slate-400' : ''} ${
          status === 'moving' ? 'bg-yellow-500' : ''
        } ${status === 'blocked' ? 'bg-red-500' : ''}`}
      />
    </div>
  );
}

// Hair sprite variations
function HairSprite({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'bowl': // Howard's bowl cut
      return (
        <>
          <rect x="8" y="4" width="16" height="10" fill={color} />
          <rect x="6" y="8" width="4" height="8" fill={color} />
          <rect x="22" y="8" width="4" height="8" fill={color} />
        </>
      );
    case 'long': // Penny's long hair
      return (
        <>
          <rect x="8" y="4" width="16" height="8" fill={color} />
          <rect x="6" y="8" width="4" height="20" fill={color} />
          <rect x="22" y="8" width="4" height="20" fill={color} />
        </>
      );
    case 'wavy': // Amy's wavy hair
      return (
        <>
          <rect x="8" y="4" width="16" height="8" fill={color} />
          <rect x="6" y="8" width="5" height="16" fill={color} />
          <rect x="21" y="8" width="5" height="16" fill={color} />
          <rect x="4" y="18" width="3" height="6" fill={color} />
          <rect x="25" y="18" width="3" height="6" fill={color} />
        </>
      );
    default: // Short hair (Sheldon, Leonard, Raj)
      return (
        <>
          <rect x="8" y="4" width="16" height="10" fill={color} />
          <rect x="10" y="2" width="12" height="4" fill={color} />
        </>
      );
  }
}

// Shirt sprite variations
function ShirtSprite({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'hoodie':
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill={color} />
          <rect x="4" y="24" width="6" height="8" fill={color} />
          <rect x="22" y="24" width="6" height="8" fill={color} />
          <rect x="12" y="22" width="8" height="4" fill={color} style={{ filter: 'brightness(0.8)' }} />
        </>
      );
    case 'turtleneck':
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill={color} />
          <rect x="4" y="24" width="6" height="8" fill={color} />
          <rect x="22" y="24" width="6" height="8" fill={color} />
          <rect x="10" y="20" width="12" height="4" fill={color} />
        </>
      );
    case 'vest':
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill="#f5f5f4" />
          <rect x="8" y="22" width="5" height="12" fill={color} />
          <rect x="19" y="22" width="5" height="12" fill={color} />
          <rect x="4" y="24" width="6" height="8" fill="#f5f5f4" />
          <rect x="22" y="24" width="6" height="8" fill="#f5f5f4" />
        </>
      );
    case 'tank':
      return (
        <>
          <rect x="10" y="22" width="12" height="12" fill={color} />
          <rect x="8" y="24" width="4" height="8" fill="#fdbcb4" />
          <rect x="20" y="24" width="4" height="8" fill="#fdbcb4" />
        </>
      );
    case 'cardigan':
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill="#f5f5f4" />
          <rect x="8" y="22" width="4" height="12" fill={color} />
          <rect x="20" y="22" width="4" height="12" fill={color} />
          <rect x="4" y="24" width="6" height="8" fill={color} />
          <rect x="22" y="24" width="6" height="8" fill={color} />
        </>
      );
    default: // t-shirt
      return (
        <>
          <rect x="8" y="22" width="16" height="12" fill={color} />
          <rect x="4" y="24" width="6" height="8" fill={color} />
          <rect x="22" y="24" width="6" height="8" fill={color} />
        </>
      );
  }
}
