import type { Models } from "appwrite";
import { Link } from "react-router-dom";

import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { getFilePreview } from "@/lib/appwrite/api";
import type { IPost } from "@/types";

type GridPostListProps = {
  posts: (IPost | Models.Document | any)[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
      {posts.map((post) => {
        const imageUrl = post.imageId
          ? getFilePreview(post.imageId)
          : typeof post.imageUrl === "string" && post.imageUrl.includes("/preview")
          ? post.imageUrl.replace("/preview", "/view")
          : post.imageUrl || "/assets/icons/profile-placeholder.svg";

        return (
          <li
            key={post.$id}
            className="group relative w-full aspect-square rounded-[24px] overflow-hidden border border-white/[0.08] hover:border-primary-500/40 bg-dark-2 transition-all duration-300 shadow-xl shadow-black/50"
          >
            <Link
              to={`/posts/${post.$id}`}
              className="block w-full h-full overflow-hidden"
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
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </Link>

            {/* Gradient Overlay for metadata & stats */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-dark-1/95 via-dark-1/70 to-transparent flex flex-col justify-end gap-2 pointer-events-none">
              <div className="flex items-center justify-between gap-2 pointer-events-auto">
                {showUser && (
                  <Link
                    to={post.creator?.$id ? `/profile/${post.creator.$id}` : "#"}
                    className="flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={
                        post.creator?.imageUrl ||
                        "/assets/icons/profile-placeholder.svg"
                      }
                      alt={post.creator?.name || "creator"}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                    />
                    <p className="text-xs font-semibold text-white truncate">
                      {post.creator?.name || "Creator"}
                    </p>
                  </Link>
                )}

                {showStats && (
                  <div className="ml-auto shrink-0">
                    <PostStats post={post as IPost} userId={user.id} />
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;