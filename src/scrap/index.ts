import * as querystring from 'querystring';
import { ScrapeConfig, ScrapeResult, ScrapflyClient } from 'scrapfly-sdk';

const INSTAGRAM_APP_ID = '936619743392459'; // This is the public app ID for instagram.com

const client = new ScrapflyClient({
  key: process.env.SCRAPFLY_KEY || '',
});

const BASE_CONFIG = {
  asp: true,
  country: 'CA',
  headers: {
    'x-ig-app-id': INSTAGRAM_APP_ID,
  },
};

const scrape = async (config: any): Promise<ScrapeResult> => {
  const response = await client.scrape(
    new ScrapeConfig({ ...BASE_CONFIG, ...config }),
  );
  return JSON.parse(response.result.content);
};

interface User {
  id: string;
  username: string;
  full_name: string;
  // Add other relevant fields
}

interface Post {
  id: string;
  shortcode: string;
  // Add other relevant fields
}

export const getUser = async (username: string): Promise<User> => {
  const { result } = await scrape({
    url: `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
  });
  return result?.data?.user;
};

export const getPost = async (shortcode: string): Promise<Post> => {
  const variables = {
    shortcode,
    child_comment_count: 20,
    fetch_comment_count: 100,
    parent_comment_count: 24,
    has_threaded_comments: true,
  };

  const url =
    'https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables=';

  const query = querystring.escape(JSON.stringify(variables));

  const { result } = await scrape({ url: url + query });
  return result?.data?.post;
};
