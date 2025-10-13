import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VideoMetadata {
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
}

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getVimeoVideoId(url: string): string | null {
  const pattern = /vimeo\.com\/(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

function detectCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const categories = {
    'Музыка': ['music', 'song', 'album', 'singer', 'band', 'concert', 'музыка', 'песня', 'альбом', 'певец', 'концерт', 'audio', 'track', 'mv', 'official video'],
    'Игры': ['game', 'gaming', 'gameplay', 'playthrough', 'walkthrough', 'lets play', 'игра', 'геймплей', 'прохождение', 'minecraft', 'fortnite', 'valorant', 'league', 'dota', 'cs:go', 'csgo'],
    'Новости': ['news', 'breaking', 'report', 'новости', 'сообщает', 'репортаж', 'breaking news', 'latest news'],
    'Спорт': ['sport', 'football', 'soccer', 'basketball', 'tennis', 'спорт', 'футбол', 'баскетбол', 'теннис', 'match', 'game', 'championship', 'olympics'],
    'Технологии': ['tech', 'technology', 'review', 'unboxing', 'технологии', 'обзор', 'распаковка', 'iphone', 'android', 'computer', 'laptop', 'gadget', 'smartphone'],
    'Образование': ['tutorial', 'how to', 'learn', 'education', 'course', 'lesson', 'обучение', 'урок', 'как', 'учиться', 'lecture', 'educational'],
    'Кулинария': ['cooking', 'recipe', 'food', 'kitchen', 'кулинария', 'рецепт', 'еда', 'готовить', 'chef', 'baking'],
    'Путешествия': ['travel', 'trip', 'vacation', 'tour', 'путешествие', 'поездка', 'отпуск', 'туризм', 'vlog', 'journey', 'adventure'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Все';
}

async function extractYouTubeMetadata(videoId: string): Promise<VideoMetadata | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    const title = data.title || 'Untitled Video';
    const description = `Video by ${data.author_name || 'Unknown'}`;
    const category = detectCategory(title, description);

    return {
      title,
      description,
      thumbnail_url: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      video_url: `https://www.youtube.com/watch?v=${videoId}`,
      category,
    };
  } catch (error) {
    console.error('YouTube extraction error:', error);
    return null;
  }
}

async function extractVimeoMetadata(videoId: string): Promise<VideoMetadata | null> {
  try {
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    const title = data.title || 'Untitled Video';
    const description = data.description || `Video by ${data.author_name || 'Unknown'}`;
    const category = detectCategory(title, description);

    return {
      title,
      description,
      thumbnail_url: data.thumbnail_url || '',
      video_url: `https://vimeo.com/${videoId}`,
      category,
    };
  } catch (error) {
    console.error('Vimeo extraction error:', error);
    return null;
  }
}

function generateFallbackMetadata(url: string): VideoMetadata {
  const urlObj = new URL(url);
  const filename = urlObj.pathname.split('/').pop() || 'video';
  const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: 'Загруженное видео',
    thumbnail_url: 'https://images.pexels.com/photos/1144275/pexels-photo-1144275.jpeg?auto=compress&cs=tinysrgb&w=640',
    video_url: url,
    category: 'Все',
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let metadata: VideoMetadata | null = null;

    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) {
      metadata = await extractYouTubeMetadata(youtubeId);
    }

    if (!metadata) {
      const vimeoId = getVimeoVideoId(url);
      if (vimeoId) {
        metadata = await extractVimeoMetadata(vimeoId);
      }
    }

    if (!metadata) {
      metadata = generateFallbackMetadata(url);
    }

    return new Response(
      JSON.stringify(metadata),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to extract video metadata' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});