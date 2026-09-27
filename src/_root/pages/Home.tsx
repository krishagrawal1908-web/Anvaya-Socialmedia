import { Link } from "react-router-dom";
import { Loader, PostCard, UserCard } from "@/components/shared";
import type { IPost, IAppwriteUser } from "@/types";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";

const Home = () => {
  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
    refetch: refetchPosts,
  } = useGetRecentPosts();

  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(8);

  return (
    <div className="flex flex-1 w-full justify-center">
      {/* Main Feed Column */}
      <div className="home-container">
        <div className="home-posts">
          {/* Header Banner */}
          <div className="flex items-center justify-between w-full pb-2 border-b border-white/[0.06]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Home Feed
              </h2>
              <p className="text-xs sm:text-sm text-light-3 mt-0.5">
                Discover what the community is sharing today
              </p>
            </div>

            <button
              onClick={() => refetchPosts()}
              title="Refresh feed"
              className="p-2.5 rounded-xl bg-dark-3/60 hover:bg-dark-3 border border-white/[0.06] text-light-3 hover:text-white transition-all duration-200 active:scale-95"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Posts Feed List */}
          {isPostLoading && !posts ? (
            <div className="flex flex-col items-center justify-center py-20 w-full">
              <Loader />
              <p className="text-xs text-light-3 mt-4 animate-pulse">
                Loading your feed...
              </p>
            </div>
          ) : isErrorPosts ? (
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Unable to load feed
              </h3>
              <p className="text-xs text-light-3 mb-4">
                We had trouble fetching the latest posts. Please try again.
              </p>
              <button
                onClick={() => refetchPosts()}
                className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          ) : !posts || posts.documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-dark-3 border border-white/10 flex items-center justify-center mb-4">
                <img
                  src="/assets/icons/posts.svg"
                  width={28}
                  height={28}
                  alt="posts"
                  className="opacity-40 invert-white"
                />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                No posts available yet
              </h3>
              <p className="text-xs text-light-3 mb-5">
                Be the first one to share an image and start the conversation!
              </p>
              <Link
                to="/create-post"
                className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
              >
                Create a Post
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-8 w-full">
              {posts.documents.map((post: IPost) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Column: Top Creators */}
      <aside className="home-creators">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-lg font-bold text-white">Top Creators</h3>
            <p className="text-xs text-light-3">People you might like</p>
          </div>
          <Link
            to="/all-users"
            className="text-xs font-semibold text-primary-500 hover:text-primary-400 transition-colors"
          >
            See all →
          </Link>
        </div>

        {isUserLoading && !creators ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : isErrorCreators ? (
          <p className="text-xs text-light-4 text-center py-6">
            Unable to load creators
          </p>
        ) : !creators || creators.documents.length === 0 ? (
          <p className="text-xs text-light-4 text-center py-6">
            No creators found
          </p>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3.5 w-full">
            {creators.documents.map((creator: IAppwriteUser) => (
              <UserCard key={creator.$id} user={creator} />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};

export default Home;
