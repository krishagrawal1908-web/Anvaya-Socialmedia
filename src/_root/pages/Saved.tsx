import { Link } from "react-router-dom";
import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";

const Saved = () => {
  const { data: currentUser, isLoading } = useGetCurrentUser();

  // Deduplicate and resolve posts
  const uniquePostsMap = new Map();
  currentUser?.save?.forEach((savePost: any) => {
    const postObj = savePost?.post;
    if (postObj && typeof postObj === "object" && postObj.$id) {
      if (!uniquePostsMap.has(postObj.$id)) {
        uniquePostsMap.set(postObj.$id, {
          ...postObj,
          creator: postObj.creator || {
            imageUrl: currentUser.imageUrl,
            name: currentUser.name,
            username: currentUser.username,
          },
        });
      }
    }
  });

  const savePosts = Array.from(uniquePostsMap.values()).reverse();

  return (
    <div className="saved-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full max-w-5xl gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-violet-600/10 border border-primary-500/30 flex items-center justify-center shadow-lg shadow-primary-500/10">
            <img
              src="/assets/icons/save.svg"
              width={24}
              height={24}
              alt="saved posts"
              className="invert-white"
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Saved Posts
              </h2>
              {savePosts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500/15 text-primary-500 border border-primary-500/30">
                  {savePosts.length}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-light-3 mt-0.5">
              Posts you have bookmarked for later
            </p>
          </div>
        </div>
      </div>

      {isLoading || !currentUser ? (
        <div className="flex-center w-full py-20">
          <Loader />
        </div>
      ) : savePosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full max-w-md py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-dark-3/80 border border-white/10 flex items-center justify-center mb-6 shadow-xl shadow-black/50">
            <img
              src="/assets/icons/save.svg"
              width={36}
              height={36}
              alt="no saved posts"
              className="opacity-40 invert-white"
            />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No saved posts yet</h3>
          <p className="text-sm text-light-3 mb-6 max-w-xs leading-relaxed">
            When you see something inspiring, tap the bookmark icon on any post to save it here.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-600 hover:to-violet-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-primary-500/25 active:scale-95"
          >
            Explore Feed
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-5xl">
          <GridPostList posts={savePosts} showStats={true} />
        </div>
      )}
    </div>
  );
};

export default Saved;