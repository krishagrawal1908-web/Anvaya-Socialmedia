import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queries";
import type { IPost } from "@/types";
import { checkIsLiked } from "@/lib/utils";

type PostStatsProps = {
  post: IPost;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const likesList = post.likes
    ? post.likes.map((user: any) => (typeof user === "string" ? user : user.$id))
    : [];

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavedPost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  const savedPostRecord = currentUser?.save?.find(
    (record: any) =>
      record?.post?.$id === post?.$id ||
      record?.post === post?.$id ||
      record?.$id === post?.$id
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser, post?.$id, savedPostRecord]);

  useEffect(() => {
    const list = post?.likes
      ? post.likes
          .map((u: any) => (typeof u === "string" ? u : u?.$id || u?.id))
          .filter(Boolean)
      : [];
    setLikes(list);
  }, [post?.likes]);

  const isLiked =
    checkIsLiked(likes, userId) ||
    (currentUser?.$id ? checkIsLiked(likes, currentUser.$id) : false);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    let updatedLikes = [...likes];
    const hasLiked = checkIsLiked(updatedLikes, userId);

    if (hasLiked) {
      updatedLikes = updatedLikes.filter((id) => id !== userId);
    } else {
      updatedLikes.push(userId);
    }

    setLikes(updatedLikes);
    likePost({
      postId: post.$id,
      likesArray: updatedLikes,
    });
  };

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      deleteSavedPost(savedPostRecord.$id);
      toast.info("Removed from saved posts");
    } else {
      setIsSaved(true);
      savePost({
        userId,
        postId: post.$id,
      });
      toast.success("Post saved successfully!");
    }
  };

  return (
    <div className="flex justify-between items-center z-20 w-full pt-1">
      {/* Like button */}
      <button
        type="button"
        onClick={handleLikePost}
        aria-label={isLiked ? "Unlike post" : "Like post"}
        className="flex items-center gap-2 group px-2 py-1.5 -ml-2 rounded-xl hover:bg-white/[0.06] active:scale-95 transition-all duration-200"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isLiked ? "#ef4444" : "none"}
          stroke={isLiked ? "#ef4444" : "#877EFF"}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-200 group-hover:scale-110 ${
            isLiked ? "scale-105 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "opacity-75 group-hover:opacity-100"
          }`}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span
          className={`text-xs font-semibold tabular-nums transition-colors duration-200 ${
            isLiked ? "text-rose-500" : "text-light-3 group-hover:text-light-1"
          }`}
        >
          {likes.length}
        </span>
      </button>

      {/* Save/Bookmark button */}
      <button
        type="button"
        onClick={handleSavePost}
        aria-label={isSaved ? "Unsave post" : "Save post"}
        className="flex items-center justify-center p-2 -mr-2 rounded-xl hover:bg-white/[0.06] active:scale-95 transition-all duration-200 group"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isSaved ? "#877EFF" : "none"}
          stroke="#877EFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-200 group-hover:scale-110 ${
            isSaved
              ? "scale-105 drop-shadow-[0_0_8px_rgba(135,126,255,0.7)]"
              : "opacity-75 group-hover:opacity-100"
          }`}
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
};

export default PostStats;
