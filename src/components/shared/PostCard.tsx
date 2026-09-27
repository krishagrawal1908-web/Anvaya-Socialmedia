import { Link } from "react-router-dom";
import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { getFilePreview } from "@/lib/appwrite/api";
import type { IPost } from "@/types";

type PostCardProps = {
  post: IPost;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();

  if (!post.creator) return null;

  // Regenerate image URL from imageId for valid fresh URL
  const imageUrl = post.imageId
    ? getFilePreview(post.imageId)
    : post.imageUrl || "/assets/icons/profile-placeholder.svg";

  const isOwner = post.creator.$id && user.id === post.creator.$id;

  return (
    <article className="w-full max-w-screen-sm rounded-[28px] bg-dark-2/90 border border-white/[0.07] hover:border-white/[0.14] p-5 sm:p-6 transition-all duration-300 shadow-2xl shadow-black/60 backdrop-blur-sm group">
      {/* Header: Creator Info & Actions */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          to={post.creator.$id ? `/profile/${post.creator.$id}` : "#"}
          className="flex items-center gap-3.5 group/creator"
        >
          <div className="relative">
            <img
              src={post.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={post.creator.name || "creator"}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-primary-500/30 group-hover/creator:ring-primary-500/70 transition-all duration-200"
              onError={(e) => {
                e.currentTarget.src = "/assets/icons/profile-placeholder.svg";
              }}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-white group-hover/creator:text-primary-500 transition-colors duration-150 leading-tight">
              {post.creator.name}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-light-3 mt-0.5">
              <span>{multiFormatDateString(post.$createdAt)}</span>
              {post.location && (
                <>
                  <span className="text-light-4">•</span>
                  <span className="flex items-center gap-1 text-light-3 truncate max-w-[150px] sm:max-w-[200px]">
                    <svg
                      className="w-3 h-3 text-primary-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>

        {isOwner && (
          <Link
            to={`/update-post/${post.$id}`}
            aria-label="Edit post"
            className="p-2 rounded-xl text-light-3 hover:text-white hover:bg-white/[0.08] transition-all duration-150"
          >
            <img
              src="/assets/icons/edit.svg"
              alt="edit"
              width={18}
              height={18}
              className="opacity-80 hover:opacity-100"
            />
          </Link>
        )}
      </div>

      {/* Caption & Tags */}
      <Link to={`/posts/${post.$id}`} className="block mb-3.5">
        {post.caption && (
          <p className="text-sm sm:text-[15px] text-light-2 font-normal leading-relaxed break-words">
            {post.caption}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {post.tags.map((tag: string, index: number) => (
              <span
                key={`${tag}-${index}`}
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Post Image */}
      <Link
        to={`/posts/${post.$id}`}
        className="block relative overflow-hidden rounded-[20px] bg-dark-1 border border-white/[0.05] group/img"
      >
        <img
          src={imageUrl}
          alt={post.caption || "post"}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.includes("/preview")) {
              target.src = target.src.replace("/preview", "/view");
            } else {
              target.src = "/assets/icons/profile-placeholder.svg";
            }
          }}
          className="w-full max-h-[520px] min-h-[260px] object-cover transition-transform duration-500 group-hover/img:scale-[1.015]"
          loading="lazy"
        />
      </Link>

      {/* Post Stats (Likes & Save) */}
      <div className="mt-3.5 pt-1 border-t border-white/[0.05]">
        <PostStats post={post} userId={user.id} />
      </div>
    </article>
  );
};

export default PostCard;