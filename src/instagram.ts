import { IgApiClient } from 'instagram-private-api';
import { readFile } from 'fs/promises';


export async function login(username: string, password: string) {
  console.log(`Logging in to Instagram as ${username}`);
  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    await ig.account.login(username, password);
    console.log('Login successful', username);
    return ig;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function uploadPhoto(ig: IgApiClient, filePath: string, caption?: string) {
  const file = await readFile(filePath);
  const result = await ig.publish.photo({ file, caption });
  console.log('Photo uploaded successfully:', result);
  return result;
}

export async function uploadVideo(ig: IgApiClient, filePath: string, coverImagePath: string, caption?: string) {
  const video = await readFile(filePath);
  const coverImage = await readFile(coverImagePath);
  const result = await ig.publish.video({ video, coverImage, caption });
  console.log('Video uploaded successfully:', result);
  return result;
}

export async function getProfile(ig: IgApiClient, userId: string) {
  return await ig.user.info(userId);

}

export async function getTimelineFeed(ig: IgApiClient, limit: number = 10) {
  const feed = ig.feed.timeline();
  feed.items = async () => {
    const items = await feed.items();
    return items.slice(0, limit);
  };
  await feed.request();
  console.log(`Fetched ${feed.items.length} items from timeline feed`);
  if (feed.items.length === 0) {
    console.warn('No items found in the timeline feed');
  }
  return await feed.items();
}
