import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });
        
        const path = join(uploadsDir, file.name);
        await writeFile(path, buffer);

        console.log(`File uploaded to: ${path}`);

        return NextResponse.json({ success: true, path: `/uploads/${file.name}` });
    } catch (error: any) {
        console.error('Error uploading file:', error);
        if (error.type === 'entity.too.large') {
             return NextResponse.json({ success: false, error: 'File is too large. Max size is 10MB.' }, { status: 413 });
        }
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}