import { useState, useEffect, useCallback } from "react";
import { followService } from "@/lib/services/followService";
import { useUserContext } from "@/context/AuthContext";
import { toast } from "sonner";

export function useFollow(targetUserId?: string, targetUsername?: string) {
  const { user } = useUserContext();
  const currentUserId = user?.id;

  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    if (!currentUserId || !targetUserId) return false;
    return followService.isFollowing(currentUserId, targetUserId);
  });

  const [followCounts, setFollowCounts] = useState<{
    followersCount: number;
    followingCount: number;
  }>(() => {
    return targetUserId
      ? followService.getFollowCounts(targetUserId)
      : { followersCount: 0, followingCount: 0 };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync state whenever IDs change
  useEffect(() => {
    if (targetUserId) {
      setFollowCounts(followService.getFollowCounts(targetUserId));
    }
    if (currentUserId && targetUserId) {
      setIsFollowing(followService.isFollowing(currentUserId, targetUserId));
    }
  }, [currentUserId, targetUserId]);

  // Real-time listener for follow/unfollow events
  useEffect(() => {
    const unsubscribe = followService.subscribe((event) => {
      // If the event affects the target user's followers or following
      if (
        event.followingId === targetUserId ||
        event.followerId === targetUserId
      ) {
        if (targetUserId) {
          setFollowCounts(followService.getFollowCounts(targetUserId));
        }
      }

      // If the event affects the current user following this target
      if (
        event.followerId === currentUserId &&
        event.followingId === targetUserId
      ) {
        setIsFollowing(event.type === "FOLLOW");
      }
    });

    return unsubscribe;
  }, [currentUserId, targetUserId]);

  const toggleFollow = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!currentUserId) {
        toast.error("Please sign in to follow creators");
        return;
      }

      if (!targetUserId) return;

      if (currentUserId === targetUserId) {
        toast.info("You cannot follow yourself");
        return;
      }

      setIsLoading(true);

      try {
        if (isFollowing) {
          const newCounts = followService.unfollowUser(currentUserId, targetUserId);
          setIsFollowing(false);
          setFollowCounts(newCounts);
          toast.info(
            targetUsername ? `Unfollowed @${targetUsername}` : "Unfollowed creator"
          );
        } else {
          const newCounts = followService.followUser(currentUserId, targetUserId);
          setIsFollowing(true);
          setFollowCounts(newCounts);
          toast.success(
            targetUsername ? `Now following @${targetUsername}!` : "Creator followed!"
          );
        }
      } catch (error) {
        console.error("Follow error:", error);
        toast.error("Failed to update follow status");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId, targetUserId, targetUsername, isFollowing]
  );

  return {
    isFollowing,
    followersCount: followCounts.followersCount,
    followingCount: followCounts.followingCount,
    toggleFollow,
    isLoading,
    isSelf: currentUserId === targetUserId,
  };
}
