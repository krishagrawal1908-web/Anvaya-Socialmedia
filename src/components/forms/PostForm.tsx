import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { PostValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";

import FileUploader from "@/components/shared/FileUploader";
import Loader from "@/components/shared/Loader";

import {
  useCreatePost,
  useUpdatePost,
} from "@/lib/react-query/queries";

import type { IPost } from "@/types";

type PostFormProps = {
  post?: IPost;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption ?? "",
      file: [],
      location: post?.location ?? "",
      tags: post?.tags?.join(",") ?? "",
    },
  });

  const {
    mutateAsync: createPost,
    isPending: isLoadingCreate,
  } = useCreatePost();

  const {
    mutateAsync: updatePost,
    isPending: isLoadingUpdate,
  } = useUpdatePost();

  const handleSubmit = async (
    value: z.infer<typeof PostValidation>
  ) => {
    try {
      // UPDATE POST
      if (post && action === "Update") {
        const updatedPost = await updatePost({
          ...value,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        });

        if (!updatedPost) {
          toast.error(
            `${action} post failed. Please try again.`
          );
          return;
        }

        toast.success("Post updated successfully.");
        navigate(`/posts/${post.$id}`);
        return;
      }

      // CREATE POST
      if (!value.file || value.file.length === 0) {
        toast.error("Please select a photo to upload.");
        return;
      }

      const newPost = await createPost({
        ...value,
        userId: user.id,
      });

      if (!newPost) {
        toast.error(
          `${action} post failed. Please try again.`
        );
        return;
      }

      toast.success("Post created successfully.");
      navigate("/");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex w-full max-w-5xl flex-col gap-9"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Caption
              </FormLabel>

              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Photos
              </FormLabel>

              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl || ""}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Location
              </FormLabel>

              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma ",")
              </FormLabel>

              <FormControl>
                <Input
                  placeholder="Art, Expression, Learn"
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;