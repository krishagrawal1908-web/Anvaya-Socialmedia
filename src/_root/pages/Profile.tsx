import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { LikedPosts } from "@/_root/pages";
import { useGetUserById, useGetUserPosts } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import { useFollow } from "@/hooks/useFollow";

interface StatBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
  <div className="flex items-center gap-2">
    <p className="text-base lg:text-lg font-bold text-primary-500 tabular-nums">
      {value}
    </p>
    <p className="text-xs lg:text-sm font-medium text-light-3">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { pathname } = useLocation();

  const { data: currentUser, isLoading: isUserLoading } = useGetUserById(id || "");
  const { data: userPosts, isLoading: isPostsLoading } = useGetUserPosts(currentUser?.$id || id);

  const {
    isFollowing,
    followersCount,
    followingCount,
    toggleFollow,
    isLoading: isFollowLoading,
    isSelf,
  } = useFollow(currentUser?.$id, currentUser?.username);

  if (isUserLoading || !currentUser) {
    return (
      <div className="flex-center w-full h-full min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  const postsList = userPosts?.documents || [];
  const postsCount = postsList.length;

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <div className="relative">
            <img
              src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              onError={(e) => {
                e.currentTarget.src = "/assets/icons/profile-placeholder.svg";
              }}
              className="w-28 h-28 lg:h-36 lg:w-36 rounded-full object-cover ring-4 ring-primary-500/20 shadow-xl shadow-primary-500/10"
            />
          </div>

          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left text-2xl lg:text-3xl font-extrabold tracking-tight text-white w-full">
                {currentUser.name}
              </h1>
              <p className="text-sm font-medium text-light-3 text-center xl:text-left mt-0.5">
                @{currentUser.username}
              </p>
            </div>

            {/* Dynamic, Real-time Stats */}
            <div className="flex gap-8 mt-7 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={postsCount} label="Posts" />
              <StatBlock value={followersCount} label="Followers" />
              <StatBlock value={followingCount} label="Following" />
            </div>

            {currentUser.bio ? (
              <p className="text-xs sm:text-sm text-light-2 text-center xl:text-left mt-6 max-w-screen-sm leading-relaxed">
                {currentUser.bio}
              </p>
            ) : (
              <p className="text-xs text-light-4 italic text-center xl:text-left mt-6">
                No bio provided yet.
              </p>
            )}
          </div>

          {/* Action Buttons: Edit or Real-time Follow */}
          <div className="flex justify-center items-start gap-4 pt-2">
            {isSelf ? (
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className="h-11 bg-dark-4 hover:bg-dark-3 border border-white/10 px-5 text-light-1 flex-center gap-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-md hover:border-primary-500/40"
              >
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={18}
                  height={18}
                />
                <span>Edit Profile</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={toggleFollow}
                disabled={isFollowLoading}
                className={`h-11 px-7 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
                  isFollowing
                    ? "bg-dark-4 hover:bg-rose-500/15 text-light-2 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 group"
                    : "bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/25 hover:shadow-primary-500/40"
                }`}
              >
                {isFollowLoading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>
                    <span className="group-hover:hidden flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Following
                    </span>
                    <span className="hidden group-hover:inline">Unfollow</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {isSelf && (
        <div className="flex max-w-5xl w-full border-b border-white/[0.06] mb-6">
          <Link
            to={`/profile/${id}`}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
              pathname === `/profile/${id}`
                ? "border-primary-500 text-primary-500 bg-primary-500/5"
                : "border-transparent text-light-3 hover:text-white"
            }`}
          >
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={18}
              height={18}
            />
            Posts ({postsCount})
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
              pathname === `/profile/${id}/liked-posts`
                ? "border-primary-500 text-primary-500 bg-primary-500/5"
                : "border-transparent text-light-3 hover:text-white"
            }`}
          >
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={18}
              height={18}
            />
            Liked Posts
          </Link>
        </div>
      )}

      {/* Posts or Liked Posts Content */}
      <Routes>
        <Route
          index
          element={
            isPostsLoading ? (
              <div className="flex-center w-full py-16">
                <Loader />
              </div>
            ) : postsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center w-full">
                <div className="w-14 h-14 rounded-2xl bg-dark-3 border border-white/10 flex items-center justify-center mb-3">
                  <img
                    src="/assets/icons/posts.svg"
                    width={24}
                    height={24}
                    alt="No posts"
                    className="opacity-40"
                  />
                </div>
                <h3 className="text-base font-semibold text-white">No posts yet</h3>
                <p className="text-xs text-light-3 mt-1 max-w-xs">
                  {isSelf
                    ? "Share your moments and creations with the community!"
                    : "This creator hasn't published any posts yet."}
                </p>
                {isSelf && (
                  <Link
                    to="/create-post"
                    className="mt-4 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors"
                  >
                    Create a Post
                  </Link>
                )}
              </div>
            ) : (
              <GridPostList posts={postsList} showUser={false} />
            )
          }
        />
        {isSelf && <Route path="/liked-posts" element={<LikedPosts />} />}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;