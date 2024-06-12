import jmespath from 'jmespath';

/**
 * Parse Instagram user's hidden web dataset for user's data
 * @param {Object} data - The user data from Instagram's API
 * @return {Object} The parsed user data
 */
export function parseUser(data: any) {
  const result = jmespath.search(
    data,
    `
        {
            name: full_name,
            username: username,
            id: id,
            category: category_name,
            business_category: business_category_name,
            phone: business_phone_number,
            email: business_email,
            bio: biography,
            bio_links: bio_links[].url,
            homepage: external_url,
            followers: edge_followed_by.count,
            follows: edge_follow.count,
            facebook_id: fbid,
            is_private: is_private,
            is_verified: is_verified,
            profile_image: profile_pic_url_hd,
            video_count: edge_felix_video_timeline.count,
            videos: edge_felix_video_timeline.edges[].node.{
                id: id,
                title: title,
                shortcode: shortcode,
                thumb: display_url,
                url: video_url,
                views: video_view_count,
                tagged: edge_media_to_tagged_user.edges[].node.user.username,
                captions: edge_media_to_caption.edges[].node.text,
                comments_count: edge_media_to_comment.count,
                comments_disabled: comments_disabled,
                taken_at: taken_at_timestamp,
                likes: edge_liked_by.count,
                location: location.name,
                duration: video_duration
            },
            image_count: edge_owner_to_timeline_media.count,
            images: edge_owner_to_timeline_media.edges[].node.{
                id: id,
                title: title,
                shortcode: shortcode,
                src: display_url,
                url: video_url,
                views: video_view_count,
                tagged: edge_media_to_tagged_user.edges[].node.user.username,
                captions: edge_media_to_caption.edges[].node.text,
                comments_count: edge_media_to_comment.count,
                comments_disabled: comments_disabled,
                taken_at: taken_at_timestamp,
                likes: edge_liked_by.count,
                location: location.name,
                accesibility_caption: accessibility_caption,
                duration: video_duration
            },
            saved_count: edge_saved_media.count,
            collections_count: edge_saved_media.count,
            related_profiles: edge_related_profiles.edges[].node.username
        }
    `,
  );

  return result;
}

/**
 * Parse Instagram post's hidden web dataset for post's data
 * @param {Object} data - The post data from Instagram's API
 * @return {Object} The parsed post data
 */
export function parsePost(data: any) {
  const result = jmespath.search(
    data,
    `
        {
            id: id,
            shortcode: shortcode,
            dimensions: dimensions,
            src: display_url,
            src_attached: edge_sidecar_to_children.edges[].node.display_url,
            has_audio: has_audio,
            video_url: video_url,
            views: video_view_count,
            plays: video_play_count,
            likes: edge_media_preview_like.count,
            location: location.name,
            taken_at: taken_at_timestamp,
            related: edge_web_media_to_related_media.edges[].node.shortcode,
            type: product_type,
            video_duration: video_duration,
            music: clips_music_attribution_info,
            is_video: is_video,
            tagged_users: edge_media_to_tagged_user.edges[].node.user.username,
            captions: edge_media_to_caption.edges[].node.text,
            related_profiles: edge_related_profiles.edges[].node.username,
            comments_count: edge_media_to_parent_comment.count,
            comments_disabled: comments_disabled,
            comments_next_page: edge_media_to_parent_comment.page_info.end_cursor,
            comments: edge_media_to_parent_comment.edges[].node.{
                id: id,
                text: text,
                created_at: created_at,
                owner: owner.username,
                owner_verified: owner.is_verified,
                viewer_has_liked: viewer_has_liked,
                likes: edge_liked_by.count
            }
        }
    `,
  );

  return result;
}
