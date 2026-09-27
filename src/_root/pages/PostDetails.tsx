import { useParams, Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Loader, GridPostList, PostStats } from "@/components/shared";
import type { IPost } from "@/types";
import { getFilePreview } from "@/lib/appwrite/api";
import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator?.$id
  );
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost: IPost) => userPost.$id !== id
  );

  const postImageUrl = post?.imageId
    ? getFilePreview(post.imageId)
    : post?.imageUrl;

  const isOwner = user.id === post?.creator?.$id;

  const handleDeletePost = () => {
    if (post && id) {
      deletePost({ postId: id, imageId: post.imageId });
      navigate(-1);
    }
  };

  return (
    <div className="post_details-container">
      {/* Back Button */}
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-light-3 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <img
            src="/assets/icons/back.svg"
            alt="back"
            width={20}
            height={20}
          />
          <span className="text-sm font-medium">Back</span>
        </Button>
      </div>

      {isLoading || !post ? (
        <div className="flex-center w-full py-24">
          <Loader />
        </div>
      ) : (
        <div className="w-full max-w-5xl rounded-[30px] bg-dark-2/90 border border-white/[0.08] shadow-2xl shadow-black/60 backdrop-blur-md overflow-hidden flex flex-col xl:flex-row">
          {/* Post Media Column */}
          <div className="xl:w-1/2 bg-dark-1 flex items-center justify-center p-4 sm:p-6 border-b xl:border-b-0 xl:border-r border-white/[0.06]">
            <img
              src={postImageUrl}
              alt={post.caption || "post"}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes("/preview")) {
                  target.src = target.src.replace("/preview", "/view");
                } else {
                  target.src = "/assets/icons/profile-placeholder.svg";
                }
              }}
              className="w-full max-h-[550px] object-contain rounded-2xl"
            />
          </div>

          {/* Post Info & Actions Column */}
          <div className="xl:w-1/2 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              {/* Creator Header */}
              <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
                <Link
                  to={`/profile/${post?.creator?.$id}`}
                  className="flex items-center gap-3.5 group/creator"
                >
                  <img
                    src={
                      post?.creator?.imageUrl ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt={post?.creator?.name || "creator"}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/30 group-hover/creator:ring-primary-500/70 transition-all"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/icons/profile-placeholder.svg";
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white group-hover/creator:text-primary-500 transition-colors">
                      {post?.creator?.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-light-3 mt-0.5">
                      <span>{multiFormatDateString(post?.$createdAt)}</span>
                      {post?.location && (
                        <>
                          <span className="text-light-4">•</span>
                          <span>{post.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>

                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/update-post/${post?.$id}`}
                      className="p-2 rounded-xl text-light-3 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Edit post"
                    >
                      <img
                        src="/assets/icons/edit.svg"
                        alt="edit"
                        width={20}
                        height={20}
                      />
                    </Link>

                    <Button
                      onClick={handleDeletePost}
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-xl text-light-3 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete post"
                    >
                      <img
                        src="/assets/icons/delete.svg"
                        alt="delete"
                        width={20}
                        height={20}
                      />
                    </Button>
                  </div>
                )}
              </div>

              {/* Caption & Tags */}
              <div className="pt-5 space-y-4">
                {post?.caption && (
                  <p className="text-sm sm:text-base text-light-1 leading-relaxed break-words">
                    {post.caption}
                  </p>
                )}

                {post?.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag: string, index: number) => (
                      <span
                        key={`${tag}-${index}`}
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Stats */}
            <div className="pt-4 border-t border-white/[0.06]">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}

      {/* More Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="w-full max-w-5xl mt-8">
          <div className="pb-4 mb-6 border-b border-white/[0.06]">
            <h3 className="text-lg md:text-xl font-bold text-white">
              More from {post?.creator?.name}
            </h3>
          </div>
          {isUserPostLoading ? (
            <Loader />
          ) : (
            <GridPostList posts={relatedPosts} />
          )}
        </div>
      )}
    </div>
  );
};

export default PostDetails;