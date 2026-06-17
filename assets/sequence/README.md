# Scroll-Driven Image Sequence Instructions

To replace the default procedural 3D particle reactor with your own custom deconstructed model video, follow these steps:

## 1. Export Video Frames
Export your model video as a sequence of PNG or JPEG images. 
- Render them at a web-friendly resolution (e.g. `1080x1080` or `1920x1080` depending on your layout).
- Highly recommend compressing the images (using tools like TinyPNG) to ensure fast load times.

## 2. Save Frames in this Directory
Place all exported frames directly inside this folder (`assets/sequence/`).

## 3. Name Format
By default, the script expects files named with sequential padded numbers, e.g.:
- `frame_000.png`
- `frame_001.png`
- `frame_002.png`
- ... up to `frame_100.png`

## 4. Toggle the Setting in JavaScript
Open `js/canvas-model.js` and update the `CONFIG` object:
```javascript
const CONFIG = {
  // 1. Change this to true to use your image sequence
  useImageSequence: true, 
  
  // 2. Adjust these details to match your files
  imageSequence: {
    folder: 'assets/sequence',
    extension: 'png',     // or 'jpg'
    prefix: 'frame_',
    totalFrames: 100,     // Total number of images in your sequence
    digits: 3             // Number of padded digits in file name (e.g. 000 is 3 digits)
  },
  
  // Procedural fallback settings (ignored when useImageSequence is true)
  procedural: {
    // ...
  }
};
```
The site will automatically start preloading your images and play them in sync with the user's scroll depth!
