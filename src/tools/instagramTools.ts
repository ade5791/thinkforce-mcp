import { z } from 'zod';
import { login, uploadPhoto, uploadVideo, getProfile, getTimelineFeed } from '../instagram.js';
import type { Tool } from 'fastmcp';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);


async function downloadFile(url: string, filename: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filePath = path.join(tempDir, filename);
  const fileStream = fs.createWriteStream(filePath);
  
  if (response.body) {
    await streamPipeline(response.body as any, fileStream);
  }
  
  return filePath;
}

function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(`Failed to cleanup file ${filePath}:`, error);
  }
}

function getFileExtension(url: string): string {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath);
  return ext || '.jpg'; // Default to .jpg if no extension found
}

export const instagramTools: Tool<any>[] = [
  {
    name: 'instagram_upload_photo',
    description: 'Upload a photo to Instagram from a URL',
    parameters: z.object({
      username: z.string().describe('Instagram username'),
      password: z.string().describe('Instagram password'),
      imageUrl: z.string().url().describe('URL of the image to upload'),
      caption: z.string().optional().describe('Photo caption')
    }),
    execute: async (args: any) => {
      const { username, password, imageUrl, caption } = args as { username: string; password: string; imageUrl: string; caption?: string };

      console.log('Executing instagram_upload_photo with args:', args);
      let localFilePath: string | null = null;
      
      try {
        const ig = await login(username, password);
        
        // Generate filename with timestamp and extension from URL
        const timestamp = Date.now();
        const extension = getFileExtension(imageUrl);
        const filename = `instagram_photo_${timestamp}${extension}`;
        
        // Download the file
        localFilePath = await downloadFile(imageUrl, filename);
        
        // Upload to Instagram
        const result = await uploadPhoto(ig, localFilePath, caption);
        
        return JSON.stringify({
          success: true,
          message: 'Photo uploaded successfully',
          ...result
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message
        });
      } finally {
        // Always cleanup the temporary file
        if (localFilePath) {
          cleanupFile(localFilePath);
        }
      }
    }
  },
  {
    name: 'instagram_upload_video',
    description: 'Upload a video to Instagram from URLs',
    parameters: z.object({
      videoUrl: z.string().url().describe('URL of the video file'),
      username: z.string().describe('Instagram username'),
      password: z.string().describe('Instagram password'),
      coverImageUrl: z.string().url().describe('URL of the cover image file'),
      caption: z.string().optional().describe('Video caption')
    }),
    execute: async (args: any) => {
      const { videoUrl, coverImageUrl, caption ,username,password} = args as { videoUrl: string; coverImageUrl: string; caption?: string; username: string; password: string };
      let localVideoPath: string | null = null;
      let localCoverPath: string | null = null;
      console.log('Executing instagram_upload_video with args:', args);

      try {
   
        const ig = await login(username, password);
        
        // Generate filenames with timestamp and extensions from URLs
        const timestamp = Date.now();
        const videoExtension = getFileExtension(videoUrl);
        const coverExtension = getFileExtension(coverImageUrl);
        const videoFilename = `instagram_video_${timestamp}${videoExtension}`;
        const coverFilename = `instagram_cover_${timestamp}${coverExtension}`;
        
        // Download both files
        localVideoPath = await downloadFile(videoUrl, videoFilename);
        localCoverPath = await downloadFile(coverImageUrl, coverFilename);
        
        // Upload to Instagram
        const result = await uploadVideo(ig, localVideoPath, localCoverPath, caption);
        
        return JSON.stringify({
          success: true,
          message: 'Video uploaded successfully',
          ...result
        });
      } catch (error: any) {
        return JSON.stringify({
          success: false,
          error: error.message
        });
      } finally {
        // Always cleanup the temporary files
        if (localVideoPath) {
          cleanupFile(localVideoPath);
        }
        if (localCoverPath) {
          cleanupFile(localCoverPath);
        }
      }
    }
  },
  {
    name: 'instagram_get_profile',
    description: 'Get Instagram profile information',
    parameters: z.object({
      userId: z.string().describe('Instagram user id'),
      username: z.string().describe('Instagram username'),
      password: z.string().describe('Instagram password')
    }),
    execute: async (args: any) => {
      const { userId, username, password } = args as { userId: string; username: string; password: string };
      console.log('Executing instagram_get_profile with args:', args);
      const ig = await login(username, password);
      const result = await getProfile(ig, userId);
      return JSON.stringify(result);
    }
  },
  {
    name: 'instagram_get_timeline',
    description: 'Get timeline feed',
    
    parameters: z.object({
      limit: z.number().int().min(1).max(50).default(10).describe('Number of posts to fetch'),
      username: z.string().describe('Instagram username'),
      password: z.string().describe('Instagram password')
    }),
    execute: async (args: any) => {
      const { limit, username, password } = args as { limit: number; username: string; password: string };
      console.log('Executing instagram_get_timeline with args:', args);
      const ig = await login(username, password);
      console.log(`Fetching timeline feed with limit: ${limit}`);
      let validatedLimit = limit;
      if (validatedLimit < 1 || validatedLimit > 50) {
        validatedLimit = 10; // Default limit if out of range
      }
      if (typeof validatedLimit !== 'number' || !Number.isInteger(validatedLimit)) {
        throw new Error('Limit must be an integer');
      }
      const result = await getTimelineFeed(ig, validatedLimit);
      if (!Array.isArray(result)) {
        throw new Error('Invalid response from Instagram API');
      }
      console.log(`Fetched ${result.length} items from timeline feed`);
      if (result.length === 0) {
        console.warn('No items found in the timeline feed');
      }
      // Return only the requested number of items
      if (result.length < validatedLimit) {
        console.warn(`Requested limit ${validatedLimit} exceeds available items ${result.length}. Returning all available items.`);
        validatedLimit = result.length; // Adjust limit to available items
      }
      // Convert result to JSON string and return
      console.log(`Returning ${result.slice(0, validatedLimit).length} items`);
      if (result.length === 0) {
        return JSON.stringify([]);
      }
      // Ensure we return a JSON string of the result
      if (typeof result !== 'object') {
        throw new Error('Result is not an object');
      }
      if (Array.isArray(result)) {
        // If result is an array, slice it to the validated limit
        return JSON.stringify(result.slice(0, validatedLimit));
      } else {
        // If result is an object, return it as is
        return JSON.stringify(result);
      } 

  }
  }
];
