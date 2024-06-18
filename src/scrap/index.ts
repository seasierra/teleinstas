import * as querystring from 'querystring';
import { parsePost, parseUser } from './parse';

const INSTAGRAM_APP_ID = '936619743392459'; // This is the public app ID for instagram.com

const BASE_CONFIG = {
  asp: true,
  country: 'CA',
  headers: {
    'x-ig-app-id': INSTAGRAM_APP_ID,
  },
};

const SCRAPEDO_TOKEN = '332ff64103604aaabf91e9070adab46d917fb3672a5';

const scrape = async (url: string) => {
  const res = await fetch(
    `https://api.scrape.do?token=${SCRAPEDO_TOKEN}&url=${encodeURIComponent(url)}`,
    BASE_CONFIG,
  );

  return res.json();
};

interface User {
  id: string;
  username: string;
  full_name: string;
  [x: string]: any;
  // Add other relevant fields
}

interface Post {
  id: string;
  shortcode: string;
  [x: string]: any;
  // Add other relevant fields
}

export const getUser = async (username: string): Promise<User> => {
  const result = await scrape(
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
  );

  return parseUser(result?.data?.user);
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

  const result = await scrape(url + query);

  return parsePost(result?.data?.shortcode_media);
};
