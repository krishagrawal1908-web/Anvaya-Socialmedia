import { Link } from "react-router-dom";
import { useFollow } from "@/hooks/useFollow";

type UserCardProps = {
  user: {
    $id: string;
    imageUrl: string;
    name: string;
    username: string;
  };
};

const UserCard = ({ user }: UserCardProps) => {
  const {
    isFollowing,
    followersCount,
    toggleFollow,
    isLoading,
    isSelf,
  } = useFollow(user.$id, user.username);

  return (
    <div className="flex flex-col items-center gap-3.5 rounded-[22px] border border-white/[0.07] hover:border-primary-500/40 bg-dark-2/90 hover:bg-dark-3/80 p-5 transition-all duration-200 shadow-lg shadow-black/30 hover:shadow-primary-500/5 group text-center">
      <Link
        to={`/profile/${user.$id}`}
        className="flex flex-col items-center gap-3 w-full"
      >
        <div className="relative">
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={user.name}
            onError={(e) => {
              e.currentTarget.src = "/assets/icons/profile-placeholder.svg";
            }}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-primary-500/20 group-hover:ring-primary-500/60 group-hover:scale-105 transition-all duration-200"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-2" />
        </div>

        <div className="flex flex-col items-center w-full min-w-0">
          <p className="text-sm font-bold text-white group-hover:text-primary-500 transition-colors truncate max-w-full">
            {user.name}
          </p>

          <p className="text-xs text-light-3 truncate max-w-full mt-0.5">
            @{user.username}
          </p>

          <span className="text-[11px] text-light-4 font-medium mt-1">
            {followersCount} {followersCount === 1 ? "follower" : "followers"}
          </span>
        </div>
      </Link>

      <div className="w-full pt-1">
        {isSelf ? (
          <Link
            to={`/profile/${user.$id}`}
            className="block w-full py-1.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-light-3 text-center transition-all duration-200"
          >
            You
          </Link>
        ) : (
          <button
            type="button"
            onClick={toggleFollow}
            disabled={isLoading}
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 ${
              isFollowing
                ? "bg-dark-4 hover:bg-rose-500/15 text-light-2 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 group/btn"
                : "bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/20 hover:shadow-primary-500/35"
            }`}
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isFollowing ? (
              <>
                <span className="group-hover/btn:hidden">Following</span>
                <span className="hidden group-hover/btn:inline">Unfollow</span>
              </>
            ) : (
              <span>Follow</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;