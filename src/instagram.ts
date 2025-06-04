import { IgApiClient } from 'instagram-private-api';
import { readFile } from 'fs/promises';

export async function login(username: string, password: string) {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  await ig.account.login(username, password);
  return ig;
}

export async function uploadPhoto(ig: IgApiClient, filePath: string, caption?: string) {
  const file = await readFile(filePath);
  const result = await ig.publish.photo({ file, caption });
  return result;
}

export async function uploadVideo(ig: IgApiClient, filePath: string, coverImagePath: string, caption?: string) {
  const video = await readFile(filePath);
  const coverImage = await readFile(coverImagePath);
  const result = await ig.publish.video({ video, coverImage, caption });
  return result;
}

export async function getProfile(ig: IgApiClient, userId: string) {
  return await ig.user.info(userId);
}

export async function getTimelineFeed(ig: IgApiClient, limit: number = 10) {
  const feed = ig.feed.timeline();
  return await feed.items();
}
