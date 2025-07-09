import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { decode as jpegDecode } from 'jpeg-js';
import { fileTypeFromBuffer } from 'file-type';
import heicConvert from 'heic-convert';

export const runtime = 'nodejs';

async function ensureRgbJpeg(buffer) {
  // Try sharp directly first
  try {
    return await sharp(buffer)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside' })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch (err) {
    // If fails due to unsupported format, attempt HEIC conversion or jpeg-js re-encode
    const ft = await fileTypeFromBuffer(buffer);
    const ext = ft?.ext || '';
    if (ext === 'heic' || ext === 'heif') {
      // Convert HEIC → JPEG then sharp again
      const jpgBuffer = await heicConvert({ buffer, format: 'JPEG', quality: 0.9 });
      return await sharp(jpgBuffer)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside' })
        .jpeg({ quality: 90 })
        .toBuffer();
    }
    if (ft?.mime === 'image/jpeg') {
      // Decode via jpeg-js then sharp
      const raw = jpegDecode(buffer, { useTArray: true, formatAsRGBA: true });
      const canvasBuffer = Buffer.from(raw.data);
      // Build sharp from raw data
      return await sharp(canvasBuffer, { raw: { width: raw.width, height: raw.height, channels: 4 } })
        .resize({ width: 2000, height: 2000, fit: 'inside' })
        .jpeg({ quality: 90 })
        .toBuffer();
    }
    throw err; // rethrow if cannot handle
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const processedBuffer = await ensureRgbJpeg(inputBuffer);

    const fileName = `${uuidv4()}.jpg`;
    const storageRef = ref(storage, `images/processed/${fileName}`);
    await uploadBytes(storageRef, processedBuffer, { contentType: 'image/jpeg' });
    const downloadURL = await getDownloadURL(storageRef);
    return NextResponse.json({ 
      url: downloadURL,
      fileName: `images/processed/${fileName}`,
      originalName: file.name 
    });
  } catch (error) {
    console.error('❌ [fix-image] Error processing image:', error);
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }
} 