import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const runtime = 'nodejs'; // Asigură că rulează în runtime Node, nu Edge

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert Blob -> Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Procesează cu sharp: rotire după EXIF, resize max 2000, convert RGB, quality 90
    const processedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside' })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Încarcă în Firebase Storage
    const fileName = `${uuidv4()}.jpg`;
    const storageRef = ref(storage, `images/processed/${fileName}`);
    await uploadBytes(storageRef, processedBuffer, { contentType: 'image/jpeg' });

    const downloadURL = await getDownloadURL(storageRef);

    return NextResponse.json({ url: downloadURL });
  } catch (error) {
    console.error('❌ [fix-image] Error processing image:', error);
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }
} 