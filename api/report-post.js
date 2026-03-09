import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://escortcanada.mooo.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ error: 'Missing postId' });

    // Fetch post details from Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();
    if (error) throw error;
    if (!post) throw new Error('Post not found');

    // Send email to yourself
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Post Reported: ${postId}`,
      text: `
Post ID: ${post.id}
Title: ${post.title}
Description: ${post.description}
Images: ${JSON.stringify(post.images)}
User ID: ${post.user_id}
Created: ${post.created_at}
VIP: ${post.is_vip}
Location: ${JSON.stringify(post.location)}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: error.message });
  }
}
