import type { VercelRequest, VercelResponse } from '@vercel/node';

interface DiscoursePost {
  topic_title?: string;
  created_at?: string;
  username?: string;
}

interface DiscoursePostsJson {
  posts?: DiscoursePost[];
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

    const response = await fetch(
      'https://us.forums.blizzard.com/en/wow/groups/blizzard-tracker/posts.json',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      throw new Error(`Blizzard forum fetch failed: ${response.status}`);
    }

    const data = (await response.json()) as DiscoursePostsJson;
    const posts = data?.posts ?? [];

    const bluePosts = posts.slice(0, 20).map((post) => ({
      title: post.topic_title ?? '',
      time: post.created_at ?? '',
      author: post.username ?? 'Blizzard',
    }));

    const latestTime = bluePosts.length > 0 ? bluePosts[0].time : null;

    res.status(200).json({
      success: true,
      latestTime,
      count: bluePosts.length,
      posts: bluePosts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
}
