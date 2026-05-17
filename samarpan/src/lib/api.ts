const API_URL = "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers || {});
  
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  } else if (typeof window !== "undefined") {
    const localToken = localStorage.getItem("token");
    if (localToken) {
      headers.set("Authorization", `Bearer ${localToken}`);
    }
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "Something went wrong";
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    
    return request("/auth/login", {
      method: "POST",
      body: formData,
    });
  },

  async register(payload: any) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMe() {
    return request("/auth/me");
  },

  // Campaigns
  async getCampaigns(params: { category?: string; search?: string; is_emergency?: boolean; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.category) query.append("category", params.category);
    if (params.search) query.append("search", params.search);
    if (params.is_emergency !== undefined) query.append("is_emergency", String(params.is_emergency));
    if (params.status) query.append("status", params.status);
    
    return request(`/campaigns?${query.toString()}`);
  },

  async getCampaign(slug: string) {
    return request(`/campaigns/${slug}`);
  },

  async likeCampaign(campaignId: string) {
    return request(`/campaigns/${campaignId}/like`, { method: "POST" });
  },

  // Donations
  async createDonation(payload: {
    campaign_id?: string | null;
    amount: number;
    currency?: string;
    is_anonymous?: boolean;
    donor_name?: string;
    donor_email?: string;
    message?: string;
    payment_method?: string;
  }) {
    return request("/donations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getDonationStats() {
    return request("/donations/stats");
  },

  async getDonations(campaignId?: string) {
    const url = campaignId ? `/donations?campaign_id=${campaignId}` : "/donations";
    return request(url);
  },

  // Volunteers
  async registerVolunteer(payload: { skills: string[]; availability: any }) {
    return request("/volunteers/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getVolunteerProfile() {
    return request("/volunteers/me");
  },

  async getVolunteerLeaderboard() {
    return request("/volunteers/leaderboard");
  },

  async getVolunteerAIMatch(campaignId: string) {
    return request(`/volunteers/ai-match?campaign_id=${campaignId}`);
  },

  // Events
  async getEvents() {
    return request("/events");
  },

  async getEvent(id: string) {
    return request(`/events/${id}`);
  },

  async rsvpEvent(eventId: string, rsvpStatus: string = "going") {
    return request(`/events/${eventId}/rsvp`, {
      method: "POST",
      body: JSON.stringify({ rsvp_status: rsvpStatus }),
    });
  },

  // Forum
  async getForumThreads(category?: string) {
    const url = category ? `/forum?category=${category}` : "/forum";
    return request(url);
  },

  async createForumThread(payload: { title: string; content: string; category: string }) {
    return request("/forum", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getForumThread(id: string) {
    return request(`/forum/${id}`);
  },

  async replyForumThread(threadId: string, content: string) {
    return request(`/forum/${threadId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  async likeForumThread(threadId: string) {
    return request(`/forum/${threadId}/like`, {
      method: "POST",
    });
  },

  // SOS / Emergency
  async getEmergencyAlerts() {
    return request("/emergency/alerts");
  },

  async submitSOS(payload: { name: string; description: string; location?: string }) {
    return request("/emergency/sos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSOSRequests() {
    return request("/emergency/sos");
  },

  // AI Chatbot
  async askAI(message: string, history: { role: string; content: string }[] = []) {
    return request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  },

  // Transparency
  async getTransparencyLogs() {
    return request("/transparency");
  },

  async createTransparencyLog(payload: { type: string; amount?: string; description: string; reference_id?: string }) {
    return request("/transparency", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Analytics
  async getAnalyticsSummary() {
    return request("/analytics/summary");
  },
};
