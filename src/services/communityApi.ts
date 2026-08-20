/**
 * Community API service - blogs, stories, forum, announcements
 * Connects to backend API database with localStorage persistence & strict deduplication
 */

import { api } from './api';

// Types
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  author_role: string;
  image_initials: string;
  color_hex: string;
  read_time: string;
  likes_count: number;
  is_published: boolean;
  created_at: string;
}

export interface VolunteerStory {
  id: number;
  name: string;
  role: string;
  avatar_initials: string;
  color_hex: string;
  story: string;
  cause: string;
  blood_donations: number;
  volunteer_hours: number;
  likes_count: number;
  is_approved: boolean;
  created_at: string;
}

export interface ForumReply {
  id: number;
  thread_id: number;
  body: string;
  author_name: string;
  likes_count: number;
  created_at: string;
}

export interface ForumThread {
  id: number;
  title: string;
  body: string;
  category: string;
  author_name: string;
  color_hex: string;
  is_pinned: boolean;
  is_locked: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  replies?: ForumReply[];
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  type: string;
  color_hex: string;
  is_active: boolean;
  created_at: string;
}

export interface CommunityStats {
  blog_count: number;
  story_count: number;
  forum_post_count: number;
  member_count: number;
}

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

// ── LocalStorage Keys ────────────────────────────────────────────────────────
const LS_BLOGS = 'SHEBABD_COMMUNITY_BLOGS_V2';
const LS_STORIES = 'SHEBABD_COMMUNITY_STORIES_V2';
const LS_THREADS = 'SHEBABD_COMMUNITY_THREADS_V2';

function loadLS<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const combined = [...parsed, ...fallback];
      const seen = new Set();
      return combined.filter(item => {
        const id = (item as any).id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

// ── Seed Fallback Data ───────────────────────────────────────────────────────
const SEED_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: "How Flood Relief Volunteers Changed 500 Lives in Sylhet",
    excerpt: "Last monsoon, a team of 47 volunteers from 6 NGOs coordinated one of the most effective flood responses Sylhet has seen in a decade.",
    content: "During the peak of last year's monsoon season, Sylhet and surrounding districts faced severe flash floods. Within 24 hours of emergency warnings, local volunteers collaborated through ShebaBD to establish 12 emergency relief hubs.\n\nOver 47 active volunteers worked round-the-clock distributing clean drinking water, dry rations, and medical supplies to 500+ marooned families across Sunamganj and Sylhet sadar.\n\nThis initiative highlighted the tremendous power of digital volunteer coordination in Bangladesh.",
    category: "Awareness",
    author_name: "Fatema Akter",
    author_role: "Volunteer Lead, Dhaka",
    image_initials: "FL",
    color_hex: "#3E7A8C",
    read_time: "5 min read",
    likes_count: 284,
    is_published: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: "Why Bangladesh Needs 100,000 More Registered Blood Donors",
    excerpt: "With only 3% of the eligible population donating blood regularly, critical shortages continue to cost lives. Smart donor matching is closing the gap.",
    content: "Blood emergency requests across Bangladeshi hospitals reach critical peaks during dengue outbreaks and trauma emergencies. Currently, less than 3% of eligible citizens donate blood regularly.\n\nBy leveraging location-aware notifications and blood group matching, ShebaBD's voluntary donor registry has cut response times from hours to under 15 minutes.\n\nLearn how you can register as a standby donor today and save lives in your municipality.",
    category: "Health",
    author_name: "Dr. Kamal Hossain",
    author_role: "Medical Volunteer, CRP",
    image_initials: "BL",
    color_hex: "#D6472C",
    read_time: "4 min read",
    likes_count: 196,
    is_published: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Green Bangladesh: 1 Million Trees in 12 Months",
    excerpt: "Chittagong Green Force just crossed a historic milestone — one million native mangroves and fruit trees planted across coastal zones.",
    content: "Coastal erosion and cyclone storm surges pose an existential challenge for coastal communities in Chittagong, Barisal, and Khulna.\n\nThrough youth mobilization and NGO partnerships, over 1,000,000 mangrove saplings have been planted along embankment zones.\n\nCommunity forestry drives not only restore local biodiversity but also protect embankments against future storm surges.",
    category: "Environment",
    author_name: "Rahim Uddin",
    author_role: "Environment Volunteer",
    image_initials: "GT",
    color_hex: "#4C8C6B",
    read_time: "3 min read",
    likes_count: 412,
    is_published: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const SEED_STORIES: VolunteerStory[] = [
  {
    id: 1,
    name: "Md. Tariq Islam",
    role: "Blood Donor, Khulna",
    avatar_initials: "TI",
    color_hex: "#D6472C",
    story: "I donated blood for the first time after ShebaBD matched me with a mother who needed O- urgently after childbirth complications. Seeing her recover made every donation feel like a life saved.",
    cause: "Blood Donation",
    blood_donations: 15,
    volunteer_hours: 45,
    likes_count: 89,
    is_approved: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    name: "Dr. Fatema Akter",
    role: "Medical Volunteer, Dhaka",
    avatar_initials: "FA",
    color_hex: "#E7A93B",
    story: "After the 2024 Sylhet floods, ShebaBD connected my medical team with three different relief orgs in 20 minutes flat. We treated 340 patients in 4 days.",
    cause: "Disaster Relief",
    blood_donations: 0,
    volunteer_hours: 140,
    likes_count: 124,
    is_approved: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 3,
    name: "Nasrin Khanam",
    role: "Education Volunteer, Sylhet",
    avatar_initials: "NK",
    color_hex: "#3E7A8C",
    story: "I teach 60 children in a flood-prone char island school. ShebaBD helped me find 8 additional volunteer teachers within a single week.",
    cause: "Education",
    blood_donations: 0,
    volunteer_hours: 320,
    likes_count: 201,
    is_approved: true,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

const SEED_THREADS: ForumThread[] = [
  {
    id: 1,
    title: "How can small NGOs access ShebaBD verification?",
    body: "We are a small NGO operating in Rangpur with about 200 beneficiaries. What documents are required for verified status?",
    category: "NGOs",
    author_name: "Kamal_NGO",
    color_hex: "#3E7A8C",
    is_pinned: true,
    is_locked: false,
    likes_count: 41,
    replies_count: 2,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    replies: [
      {
        id: 101,
        thread_id: 1,
        body: "We registered as a small org last year. The primary requirement is your NGO Affairs Bureau or Social Welfare registration certificate.",
        author_name: "Nasrin_Helper",
        likes_count: 12,
        created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
      },
      {
        id: 102,
        thread_id: 1,
        body: "You can email verify@shebabd.org with your registration document, utility bill, and executive board list for fast verification.",
        author_name: "ShebaBD_Support",
        likes_count: 18,
        created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
    ],
  },
  {
    id: 2,
    title: "Best practices for coordinating multi-org disaster response",
    body: "After working through three flood responses this year, I noticed repeated communication gaps across local field teams. Looking for input from experienced coordinators.",
    category: "Emergency",
    author_name: "Relief_Coordinator",
    color_hex: "#D6472C",
    is_pinned: true,
    is_locked: false,
    likes_count: 67,
    replies_count: 1,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    replies: [
      {
        id: 103,
        thread_id: 2,
        body: "Establishing a shared WhatsApp or Telegram dispatch group with one designated representative per NGO works best in field situations.",
        author_name: "Barisal_Relief",
        likes_count: 24,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 3,
    title: "Looking for medical volunteers in Rajshahi — urgent",
    body: "We need 4 more doctors or nurses for a 3-day health camp next weekend in Rajshahi char areas. Travel and food covered.",
    category: "Volunteers",
    author_name: "RajshahiHealth",
    color_hex: "#E7A93B",
    is_pinned: false,
    is_locked: false,
    likes_count: 28,
    replies_count: 0,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    replies: [],
  },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "ShebaBD Emergency Broadcast: Cyclone Preparedness Alert",
    body: "A Category 3 cyclone is tracking toward the southeastern coast. All coastal volunteer teams and partner NGOs should activate emergency protocols and standby relief units.",
    type: "URGENT",
    color_hex: "#D6472C",
    is_active: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 2,
    title: "New Feature: AI Donation Advisor Now Live",
    body: "Calculate the exact impact of your donation — meals provided, school days funded, trees planted — before you give.",
    type: "PLATFORM",
    color_hex: "#3E7A8C",
    is_active: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Volunteer Milestone: 18,000 Active Volunteers Reached",
    body: "We crossed 18,000 registered volunteers this week — a 96% growth in 12 months across all 64 districts of Bangladesh.",
    type: "MILESTONE",
    color_hex: "#22C55E",
    is_active: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// Helper to deduplicate items by ID
function deduplicateById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// API calls with Database connection & LocalStorage persistence
export const communityApi = {
  // Stats
  async getStats(): Promise<CommunityStats> {
    try {
      const response = await api.get('/community/stats');
      return response.data;
    } catch {
      const stories = loadLS(LS_STORIES, SEED_STORIES);
      const blogs = loadLS(LS_BLOGS, SEED_BLOGS);
      const threads = loadLS(LS_THREADS, SEED_THREADS);
      return {
        blog_count: blogs.length,
        story_count: stories.length,
        forum_post_count: threads.length + 12,
        member_count: 18450 + stories.length,
      };
    }
  },

  // Blogs
  async getBlogs(params?: { skip?: number; limit?: number; category?: string }): Promise<BlogPost[]> {
    try {
      const response = await api.get('/community/blogs', { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        const local = loadLS<BlogPost>(LS_BLOGS, SEED_BLOGS);
        const merged = deduplicateById([...response.data, ...local]);
        saveLS(LS_BLOGS, merged);
        return merged;
      }
    } catch (err) {
      console.warn('API unavailable, loading local blogs:', err);
    }
    return deduplicateById(loadLS(LS_BLOGS, SEED_BLOGS));
  },

  async getBlog(id: number): Promise<BlogPost> {
    try {
      const response = await api.get(`/community/blogs/${id}`);
      return response.data;
    } catch {
      const local = loadLS<BlogPost>(LS_BLOGS, SEED_BLOGS);
      const found = local.find(b => b.id === id);
      return found || local[0];
    }
  },

  async createBlog(data: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    read_time?: string;
  }): Promise<BlogPost> {
    let created: BlogPost | null = null;
    try {
      const response = await api.post('/community/blogs', data);
      created = response.data;
    } catch {
      created = {
        id: Date.now(),
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        author_name: "ShebaBD Contributor",
        author_role: "Community Member",
        image_initials: data.title.slice(0, 2).toUpperCase() || "SB",
        color_hex: "#3E7A8C",
        read_time: data.read_time || "5 min read",
        likes_count: 1,
        is_published: true,
        created_at: new Date().toISOString(),
      };
    }
    const current = loadLS<BlogPost>(LS_BLOGS, SEED_BLOGS);
    const updated = deduplicateById([created!, ...current]);
    saveLS(LS_BLOGS, updated);
    return created!;
  },

  async likeBlog(id: number): Promise<LikeResponse> {
    try {
      const response = await api.post(`/community/blogs/${id}/like`);
      return response.data;
    } catch {
      const blogs = loadLS<BlogPost>(LS_BLOGS, SEED_BLOGS);
      const updated = blogs.map(b => b.id === id ? { ...b, likes_count: b.likes_count + 1 } : b);
      saveLS(LS_BLOGS, updated);
      const b = updated.find(x => x.id === id);
      return { liked: true, likes_count: b ? b.likes_count : 1 };
    }
  },

  // Stories
  async getStories(params?: { skip?: number; limit?: number }): Promise<VolunteerStory[]> {
    try {
      const response = await api.get('/community/stories', { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        const local = loadLS<VolunteerStory>(LS_STORIES, SEED_STORIES);
        const merged = deduplicateById([...response.data, ...local]);
        saveLS(LS_STORIES, merged);
        return merged;
      }
    } catch (err) {
      console.warn('API unavailable, loading local stories:', err);
    }
    return deduplicateById(loadLS(LS_STORIES, SEED_STORIES));
  },

  async createStory(data: {
    name: string;
    role: string;
    story: string;
    cause: string;
    blood_donations?: number;
    volunteer_hours?: number;
  }): Promise<VolunteerStory> {
    let created: VolunteerStory | null = null;
    try {
      const response = await api.post('/community/stories', data);
      created = response.data;
    } catch {
      created = {
        id: Date.now(),
        name: data.name,
        role: data.role,
        avatar_initials: data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || "VS",
        color_hex: "#E7A93B",
        story: data.story,
        cause: data.cause,
        blood_donations: data.blood_donations || 0,
        volunteer_hours: data.volunteer_hours || 0,
        likes_count: 1,
        is_approved: true,
        created_at: new Date().toISOString(),
      };
    }
    const current = loadLS<VolunteerStory>(LS_STORIES, SEED_STORIES);
    const updated = deduplicateById([created!, ...current]);
    saveLS(LS_STORIES, updated);
    return created!;
  },

  async likeStory(id: number): Promise<LikeResponse> {
    try {
      const response = await api.post(`/community/stories/${id}/like`);
      return response.data;
    } catch {
      const stories = loadLS<VolunteerStory>(LS_STORIES, SEED_STORIES);
      const updated = stories.map(s => s.id === id ? { ...s, likes_count: s.likes_count + 1 } : s);
      saveLS(LS_STORIES, updated);
      const s = updated.find(x => x.id === id);
      return { liked: true, likes_count: s ? s.likes_count : 1 };
    }
  },

  // Forum
  async getThreads(params?: { skip?: number; limit?: number; category?: string }): Promise<ForumThread[]> {
    try {
      const response = await api.get('/community/forum', { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        const local = loadLS<ForumThread>(LS_THREADS, SEED_THREADS);
        const merged = deduplicateById([...response.data, ...local]);
        saveLS(LS_THREADS, merged);
        return merged;
      }
    } catch (err) {
      console.warn('API unavailable, loading local threads:', err);
    }
    return deduplicateById(loadLS(LS_THREADS, SEED_THREADS));
  },

  async createThread(data: {
    title: string;
    body: string;
    category: string;
  }): Promise<ForumThread> {
    let created: ForumThread | null = null;
    try {
      const response = await api.post('/community/forum', data);
      created = response.data;
    } catch {
      created = {
        id: Date.now(),
        title: data.title,
        body: data.body,
        category: data.category,
        author_name: "Community Member",
        color_hex: "#3E7A8C",
        is_pinned: false,
        is_locked: false,
        likes_count: 1,
        replies_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        replies: [],
      };
    }
    const current = loadLS<ForumThread>(LS_THREADS, SEED_THREADS);
    const updated = deduplicateById([created!, ...current]);
    saveLS(LS_THREADS, updated);
    return created!;
  },

  async getThread(id: number): Promise<ForumThread> {
    try {
      const response = await api.get(`/community/forum/${id}`);
      return response.data;
    } catch {
      const threads = loadLS<ForumThread>(LS_THREADS, SEED_THREADS);
      const found = threads.find(t => t.id === id);
      return found || threads[0];
    }
  },

  async replyToThread(threadId: number, data: { body: string }): Promise<ForumReply> {
    let reply: ForumReply | null = null;
    try {
      const response = await api.post(`/community/forum/${threadId}/replies`, data);
      reply = response.data;
    } catch {
      reply = {
        id: Date.now(),
        thread_id: threadId,
        body: data.body,
        author_name: "You",
        likes_count: 0,
        created_at: new Date().toISOString(),
      };
    }
    const threads = loadLS<ForumThread>(LS_THREADS, SEED_THREADS);
    const updated = threads.map(t => {
      if (t.id === threadId) {
        const existingReplies = t.replies || [];
        const dedupedReplies = existingReplies.some(r => r.id === reply!.id)
          ? existingReplies
          : [...existingReplies, reply!];
        return {
          ...t,
          replies: dedupedReplies,
          replies_count: dedupedReplies.length,
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });
    saveLS(LS_THREADS, updated);
    return reply!;
  },

  async likeThread(id: number): Promise<LikeResponse> {
    try {
      const response = await api.post(`/community/forum/${id}/like`);
      return response.data;
    } catch {
      const threads = loadLS<ForumThread>(LS_THREADS, SEED_THREADS);
      const updated = threads.map(t => t.id === id ? { ...t, likes_count: t.likes_count + 1 } : t);
      saveLS(LS_THREADS, updated);
      const t = updated.find(x => x.id === id);
      return { liked: true, likes_count: t ? t.likes_count : 1 };
    }
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await api.get('/community/announcements');
      if (Array.isArray(response.data) && response.data.length > 0) return response.data;
    } catch {
      // return seed
    }
    return SEED_ANNOUNCEMENTS;
  },

  // Delete methods
  async deleteBlog(id: number): Promise<void> {
    try {
      await api.delete(`/community/blogs/${id}`);
    } catch (err) {
      console.warn('API delete failed, removing locally:', err);
    }
    const current = loadLS<BlogPost>(LS_BLOGS, SEED_BLOGS);
    const updated = current.filter(b => b.id !== id);
    saveLS(LS_BLOGS, updated);
  },

  async deleteStory(id: number): Promise<void> {
    try {
      await api.delete(`/community/stories/${id}`);
    } catch (err) {
      console.warn('API delete failed, removing locally:', err);
    }
    const current = loadLS<VolunteerStory>(LS_STORIES, SEED_STORIES);
    const updated = current.filter(s => s.id !== id);
    saveLS(LS_STORIES, updated);
  },

  async deleteThread(id: number): Promise<void> {
    try {
      await api.delete(`/community/forum/${id}`);
    } catch (err) {
      console.warn('API delete failed, removing locally:', err);
    }
    const current = loadLS<ForumThread>(LS_THREADS, SEED_THREADS);
    const updated = current.filter(t => t.id !== id);
    saveLS(LS_THREADS, updated);
  },
};

export default communityApi;// Murad: Like and reply handlers
