import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PreviewMetadata {
  title: string;
  description: string;
  imageUrl: string;
  sourcePlatform: string;
  authorName: string;
  publishDate: string; // YYYY-MM-DD
  url: string;
}

export async function fetchLinkMetadata(targetUrl: string): Promise<PreviewMetadata> {
  let normalizedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  const parsedUrl = new URL(normalizedUrl);
  const hostname = parsedUrl.hostname.replace(/^www\./, '');

  let sourcePlatform = '';
  if (hostname.includes('linkedin.com')) sourcePlatform = 'LinkedIn';
  else if (hostname.includes('facebook.com')) sourcePlatform = 'Facebook';
  else if (hostname.includes('twitter.com') || hostname.includes('x.com')) sourcePlatform = 'X (Twitter)';
  else if (hostname.includes('instagram.com')) sourcePlatform = 'Instagram';
  else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) sourcePlatform = 'YouTube';
  else {
    // Capitalize domain name as default source platform
    const parts = hostname.split('.');
    sourcePlatform = parts.length > 1 ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : hostname;
  }

  let title = '';
  let description = '';
  let imageUrl = '';
  let authorName = '';
  let publishDate = new Date().toISOString().split('T')[0];

  try {
    const response = await axios.get(normalizedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CoreseminBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      maxRedirects: 5
    });

    const html = response.data;
    if (typeof html === 'string') {
      const $ = cheerio.load(html);

      // Extract title
      title = 
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('meta[property="twitter:title"]').attr('content') ||
        $('title').first().text() ||
        '';

      // Extract description
      description = 
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[property="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '';

      // Extract image
      const rawImage = 
        $('meta[property="og:image"]').attr('content') ||
        $('meta[property="og:image:secure_url"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[property="twitter:image"]').attr('content') ||
        $('link[rel="image_src"]').attr('href') ||
        '';

      if (rawImage) {
        try {
          imageUrl = new URL(rawImage, normalizedUrl).href;
        } catch {
          imageUrl = rawImage;
        }
      }

      // Extract site name / platform if og:site_name is found
      const siteName = $('meta[property="og:site_name"]').attr('content');
      if (siteName) {
        sourcePlatform = siteName.trim();
      }

      // Extract author
      authorName = 
        $('meta[name="author"]').attr('content') ||
        $('meta[property="article:author"]').attr('content') ||
        $('meta[name="twitter:creator"]').attr('content') ||
        '';

      // Extract publish date if present
      const rawDate = 
        $('meta[property="article:published_time"]').attr('content') ||
        $('meta[name="publish_date"]').attr('content') ||
        $('meta[name="date"]').attr('content') ||
        $('time[datetime]').attr('datetime');

      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          publishDate = parsed.toISOString().split('T')[0];
        }
      }
    }
  } catch (err: any) {
    console.warn(`Could not fetch full metadata for ${normalizedUrl}:`, err?.message || err);
  }

  // Si falta la foto, se usará el logo por defecto: '/CORESEMIN-LOGO.png'
  if (!imageUrl) {
    imageUrl = '/CORESEMIN-LOGO.png';
  }

  return {
    title: title.trim(),
    description: description.trim(),
    imageUrl: imageUrl.trim(),
    sourcePlatform: sourcePlatform.trim(),
    authorName: authorName.trim(),
    publishDate,
    url: normalizedUrl
  };
}
