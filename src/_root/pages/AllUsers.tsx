import { toast } from "sonner";
import { Loader, UserCard } from "@/components/shared";
import { useGetUsers } from "@/lib/react-query/queries";

const AllUsers = () => {
  const {
    data: creators,
    isLoading,
    isError: isErrorCreators,
  } = useGetUsers();

  if (isErrorCreators) {
    toast.error("Something went wrong loading users.");
    return null;
  }

  return (
    <div className="common-container">
      <div className="user-container">
        {/* Header */}
        <div className="flex flex-col gap-1 w-full text-left pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              All Users
            </h2>
            {creators?.documents && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500/15 text-primary-500 border border-primary-500/30">
                {creators.documents.length} creators
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-light-3">
            Discover and connect with members across the community
          </p>
        </div>

        {/* Users Grid */}
        {isLoading && !creators ? (
          <div className="flex-center w-full py-20">
            <Loader />
          </div>
        ) : !creators || creators.documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-16 text-center">
            <p className="text-sm text-light-3">No creators found yet.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full max-w-5xl">
            {creators.documents.map((creator: any) => (
              <li key={creator?.$id} className="w-full">
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;