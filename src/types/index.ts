import type { Models } from "appwrite";

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type IPost = Models.Document & {
  caption: string;
  imageId: string;
  imageUrl: string;
  location?: string;
  tags: string[];
  creator?: {
    $id?: string;
    imageUrl: string;
    name?: string;
    username?: string;
  };
  Creator?: {
    $id?: string;
    imageUrl: string;
    name?: string;
    username?: string;
  };
  likes?: string[];
  [key: string]: any;
};

export type IAppwriteUser = Models.Document & {
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  imageId?: string;
  posts?: IPost[];
  liked?: IPost[];
  save?: ISavedPost[];
  [key: string]: any;
};

export type ISavedPost = Models.Document & {
  user: string;
  post: IPost;
  [key: string]: any;
};