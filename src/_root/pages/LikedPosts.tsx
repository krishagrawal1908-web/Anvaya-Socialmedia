import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser, useGetUserLikedPosts } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUser();
  const { data: likedPosts, isLoading: isLikedLoading } = useGetUserLikedPosts(
    currentUser?.$id
  );

  if (isUserLoading || isLikedLoading) {
    return (
      <div className="flex-center w-full py-16">
        <Loader />
      </div>
    );
  }

  const posts = likedPosts || [];

  return (
    <div className="w-full mt-6">
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 text-rose-500">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-white">No liked posts yet</h3>
          <p className="text-xs text-light-3 mt-1 max-w-xs">
            Posts you like across your feed and explore will appear here in real time.
          </p>
        </div>
      ) : (
        <GridPostList posts={posts} showStats={true} />
      )}
    </div>
  );
};

export default LikedPosts;