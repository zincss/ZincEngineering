import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 360, // Large text for the icon
          background: '#DFFF00', // Your exact Acid Yellow hex
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'black',
          borderRadius: '80px', // Matches the rounded-xl look scaled up
          fontWeight: 900, // Matches 'font-black'
          fontFamily: 'sans-serif',
        }}
      >
        Z
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}