/**
 * Real-time Follow and Social Relationship Service
 *
 * Provides persistent follow/unfollow functionality with:
 * - Real-time cross-tab synchronization via BroadcastChannel
 * - Reactive event subscriptions for instant UI updates without polling
 * - Accurate dynamic counts (0 demo data)
 */

type FollowEvent = {
  type: "FOLLOW" | "UNFOLLOW";
  followerId: string;
  followingId: string;
  timestamp: number;
};

type FollowListener = (event: FollowEvent) => void;

class FollowService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<FollowListener> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel("anvaya_social_channel");
        this.channel.onmessage = (event) => {
          if (event.data && (event.data.type === "FOLLOW" || event.data.type === "UNFOLLOW")) {
            this.notifyListeners(event.data);
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel not supported or restricted:", e);
      }

      // Fallback cross-tab sync via storage events
      window.addEventListener("storage", (e) => {
        if (e.key?.startsWith("anvaya_follow_")) {
          try {
            const data = e.newValue ? JSON.parse(e.newValue) : null;
            if (data?.lastEvent) {
              this.notifyListeners(data.lastEvent);
            }
          } catch {}
        }
      });
    }
  }

  private getFollowingKey(userId: string): string {
    return `anvaya_following_${userId}`;
  }

  private getFollowersKey(userId: string): string {
    return `anvaya_followers_${userId}`;
  }

  /**
   * Get array of user IDs that target user is following
   */
  public getFollowing(userId: string): string[] {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(this.getFollowingKey(userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get array of user IDs that follow target user
   */
  public getFollowers(userId: string): string[] {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(this.getFollowersKey(userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Check if followerId is following followingId
   */
  public isFollowing(followerId: string, followingId: string): boolean {
    if (!followerId || !followingId) return false;
    const following = this.getFollowing(followerId);
    return following.includes(followingId);
  }

  /**
   * Get accurate real-time counts for followers and following (no demo data)
   */
  public getFollowCounts(userId: string): { followersCount: number; followingCount: number } {
    if (!userId) return { followersCount: 0, followingCount: 0 };
    const followers = this.getFollowers(userId);
    const following = this.getFollowing(userId);
    return {
      followersCount: followers.length,
      followingCount: following.length,
    };
  }

  /**
   * Follow a user
   */
  public followUser(followerId: string, followingId: string): { followersCount: number; followingCount: number } {
    if (!followerId || !followingId || followerId === followingId) {
      return this.getFollowCounts(followingId);
    }

    // 1. Update followerId's following list
    const currentFollowing = this.getFollowing(followerId);
    if (!currentFollowing.includes(followingId)) {
      const updatedFollowing = [...currentFollowing, followingId];
      localStorage.setItem(this.getFollowingKey(followerId), JSON.stringify(updatedFollowing));
    }

    // 2. Update followingId's followers list
    const currentFollowers = this.getFollowers(followingId);
    if (!currentFollowers.includes(followerId)) {
      const updatedFollowers = [...currentFollowers, followerId];
      localStorage.setItem(this.getFollowersKey(followingId), JSON.stringify(updatedFollowers));
    }

    const event: FollowEvent = {
      type: "FOLLOW",
      followerId,
      followingId,
      timestamp: Date.now(),
    };

    // Store trigger for cross-tab storage event
    try {
      localStorage.setItem(
        "anvaya_follow_event",
        JSON.stringify({ lastEvent: event, timestamp: Date.now() })
      );
    } catch {}

    this.broadcastEvent(event);
    return this.getFollowCounts(followingId);
  }

  /**
   * Unfollow a user
   */
  public unfollowUser(followerId: string, followingId: string): { followersCount: number; followingCount: number } {
    if (!followerId || !followingId) {
      return this.getFollowCounts(followingId);
    }

    // 1. Update followerId's following list
    const currentFollowing = this.getFollowing(followerId);
    const updatedFollowing = currentFollowing.filter((id) => id !== followingId);
    localStorage.setItem(this.getFollowingKey(followerId), JSON.stringify(updatedFollowing));

    // 2. Update followingId's followers list
    const currentFollowers = this.getFollowers(followingId);
    const updatedFollowers = currentFollowers.filter((id) => id !== followerId);
    localStorage.setItem(this.getFollowersKey(followingId), JSON.stringify(updatedFollowers));

    const event: FollowEvent = {
      type: "UNFOLLOW",
      followerId,
      followingId,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(
        "anvaya_follow_event",
        JSON.stringify({ lastEvent: event, timestamp: Date.now() })
      );
    } catch {}

    this.broadcastEvent(event);
    return this.getFollowCounts(followingId);
  }

  /**
   * Subscribe to follow events in real-time
   */
  public subscribe(listener: FollowListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcastEvent(event: FollowEvent): void {
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }
    this.notifyListeners(event);
  }

  private notifyListeners(event: FollowEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in follow listener:", err);
      }
    });
  }
}

export const followService = new FollowService();
