import { z } from 'zod';
import { login, uploadPhoto, uploadVideo, getProfile, getTimelineFeed } from '../instagram';
import type { Tool } from 'fastmcp';

function getCredentials() {
  const username = process.env.IG_USERNAME;
  const password = process.env.IG_PASSWORD;
  if (!username || !password) {
    throw new Error('Instagram credentials not provided');
  }
  return { username, password };
}

export const instagramTools: Tool<any>[] = [
  {
    name: 'instagram_upload_photo',
    description: 'Upload a photo to Instagram',
    parameters: z.object({
      filePath: z.string().describe('Path to image file'),
      caption: z.string().optional().describe('Photo caption')
    }),
    execute: async (args: any) => {
      const { filePath, caption } = args as { filePath: string; caption?: string };
      const { username, password } = getCredentials();
      const ig = await login(username, password);
      const result = await uploadPhoto(ig, filePath, caption);
      return JSON.stringify(result);
    }
  },
  {
    name: 'instagram_upload_video',
    description: 'Upload a video to Instagram',
    parameters: z.object({
      videoPath: z.string().describe('Path to video file'),
      coverImagePath: z.string().describe('Path to cover image file'),
      caption: z.string().optional().describe('Video caption')
    }),
    execute: async (args: any) => {
      const { videoPath, coverImagePath, caption } = args as { videoPath: string; coverImagePath: string; caption?: string };
      const { username, password } = getCredentials();
      const ig = await login(username, password);
      const result = await uploadVideo(ig, videoPath, coverImagePath, caption);
      return JSON.stringify(result);
    }
  },
  {
    name: 'instagram_get_profile',
    description: 'Get Instagram profile information',
    parameters: z.object({
      userId: z.string().describe('Instagram user id')
    }),
    execute: async (args: any) => {
      const { userId } = args as { userId: string };
      const { username, password } = getCredentials();
      const ig = await login(username, password);
      const result = await getProfile(ig, userId);
      return JSON.stringify(result);
    }
  },
  {
    name: 'instagram_get_timeline',
    description: 'Get timeline feed',
    parameters: z.object({
      limit: z.number().int().min(1).max(50).default(10).describe('Number of posts to fetch')
    }),
    execute: async (args: any) => {
      const { limit } = args as { limit: number };
      const { username, password } = getCredentials();
      const ig = await login(username, password);
      const result = await getTimelineFeed(ig, limit);
      return JSON.stringify(result.slice(0, limit));
    }
  }
];
