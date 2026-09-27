import { useParams } from "react-router-dom";

import { Loader } from "@/components/shared";
import PostForm from "@/components/forms/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";

const EditPost = () => {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-3">Post not found.</p>
      </div>
    );
  }

  const { data: post, isLoading } = useGetPostById(id);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-3">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />

          <h2 className="h3-bold md:h2-bold text-left w-full">
            Edit Post
          </h2>
        </div>

        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

export default EditPost;