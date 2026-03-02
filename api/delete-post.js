// api/delete-post.js
import { createClient } from '@supabase/supabase-js';

// Helper to extract file path from GitHub URL (jsDelivr or raw)
function extractFilePathFromUrl(url) {
  try {
    const urlObj = new URL(url);
    // jsDelivr format: https://cdn.jsdelivr.net/gh/owner/repo@commit/path
    if (urlObj.hostname.includes('jsdelivr')) {
      const pathParts = urlObj.pathname.split('/');
      // path after /gh/owner/repo@commit/...
      // e.g., /gh/owner/repo@commit/folder/file.jpg -> ['gh', 'owner', 'repo@commit', 'folder', 'file.jpg']
      // we need everything after the third part (repo@commit)
      if (pathParts.length >= 4 && pathParts[1] === 'gh') {
        return pathParts.slice(4).join('/'); // folder/file.jpg
      }
    } else if (urlObj.hostname.includes('githubusercontent')) {
      // raw format: https://raw.githubusercontent.com/owner/repo/branch/path
      const pathParts = urlObj.pathname.split('/');
      // e.g., /owner/repo/branch/path -> after 4 parts
      if (pathParts.length >= 5) {
        return pathParts.slice(4).join('/');
      }
    }
    throw new Error('Unsupported URL format');
  } catch (e) {
    throw new Error('Invalid image URL');
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://escortcanada.mooo.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      return res.status(400).json({ error: 'Missing postId or userId' });
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Fetch the post to get image URLs and verify ownership
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('user_id, images')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post.user_id !== userId) {
      return res.status(403).json({ error: 'You do not own this post' });
    }

    // 2. Delete images from GitHub
    const imageUrls = post.images || [];
    const deletionResults = [];

    for (const url of imageUrls) {
      try {
        const filePath = extractFilePathFromUrl(url);
        if (!filePath) continue;

        // GitHub API delete file
        const githubApiUrl = `https://api.github.com/repos/${process.env.PICSER_GITHUB_OWNER}/${process.env.PICSER_GITHUB_REPO}/contents/${filePath}`;
        
        // First get the file's SHA (required for deletion)
        const getResponse = await fetch(githubApiUrl, {
          headers: {
            Authorization: `token ${process.env.PICSER_GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (getResponse.ok) {
          const fileInfo = await getResponse.json();
          const sha = fileInfo.sha;

          // Delete the file
          const deleteResponse = await fetch(githubApiUrl, {
            method: 'DELETE',
            headers: {
              Authorization: `token ${process.env.PICSER_GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Delete image for post ${postId}`,
              sha,
              branch: process.env.PICSER_GITHUB_BRANCH || 'main',
            }),
          });

          if (deleteResponse.ok) {
            deletionResults.push({ url, success: true });
          } else {
            const errorText = await deleteResponse.text();
            deletionResults.push({ url, success: false, error: errorText });
          }
        } else {
          // File might not exist (already deleted)
          deletionResults.push({ url, success: false, error: 'File not found' });
        }
      } catch (err) {
        deletionResults.push({ url, success: false, error: err.message });
      }
    }

    // 3. Delete the post from Supabase (regardless of image deletion status)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }

    // Return success with details about image deletions
    res.status(200).json({
      success: true,
      message: 'Post deleted',
      imageDeletions: deletionResults,
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
}
