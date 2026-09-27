import { ID, Query } from "appwrite";

import {
  appwriteConfig,
  account,
  databases,
  storage,
  avatars,
} from "./config";

import type {
  IUpdatePost,
  INewPost,
  INewUser,
  IUpdateUser,
  IPost,
  IAppwriteUser,
} from "@/types";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw new Error("Account creation failed");

    const avatarUrl = avatars.getInitials(user.name);

    let newUser;
    try {
      newUser = await saveUserToDB({
        accountId: newAccount.$id,
        name: newAccount.name,
        email: newAccount.email,
        username: user.username,
        imageUrl: avatarUrl.toString(),
      });
    } catch (dbError) {
      console.warn("Could not save user to DB immediately:", dbError);
    }

    return newUser || newAccount;
  } catch (error) {
    console.error("createUserAccount error:", error);
    throw error;
  }
}

// ============================== SAVE USER TO DB

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.error("saveUserToDB error:", error);
    throw error;
  }
}

// ============================== SIGN IN

export async function signInAccount(user: {
  email: string;
  password: string;
}) {
  try {
    // If a session already exists for this user, reuse it
    try {
      const existingAccount = await account.get();
      if (existingAccount) {
        if (existingAccount.email.toLowerCase() === user.email.toLowerCase()) {
          const currentSession = await account.getSession("current");
          return currentSession;
        } else {
          // Different user active, delete existing session first
          await account.deleteSession("current");
        }
      }
    } catch {
      // No active session, proceed normally
    }

    const session = await account.createEmailPasswordSession({
      email: user.email,
      password: user.password,
    });

    return session;
  } catch (error: any) {
    console.error("signInAccount error:", error);

    // If Appwrite says a session is already active, try to clear and recreate
    const errorMsg = error?.message || "";
    if (
      errorMsg.toLowerCase().includes("session is active") ||
      error?.code === 400 ||
      error?.code === 401
    ) {
      try {
        await account.deleteSession("current");
        return await account.createEmailPasswordSession({
          email: user.email,
          password: user.password,
        });
      } catch (retryError) {
        console.error("Session recreation retry error:", retryError);
      }
    }
    throw error;
  }
}

// ============================== GET ACCOUNT

export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch {
    return null;
  }
}

// ============================== GET USER

export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) return null;

    let currentUserDoc: IAppwriteUser | null = null;

    try {
      const currentUser = await databases.listDocuments<IAppwriteUser>(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", currentAccount.$id)]
      );

      if (currentUser && currentUser.documents.length > 0) {
        currentUserDoc = currentUser.documents[0];
      }
    } catch (listError) {
      console.warn("Could not query user collection:", listError);
    }

    // If user document is found in DB, return it with populated saves
    if (currentUserDoc) {
      const userSaves = await getUserSaves(currentUserDoc.$id, currentAccount.$id);
      return {
        ...currentUserDoc,
        save: userSaves,
      };
    }

    // Otherwise, create user document if possible
    try {
      const avatarUrl = avatars.getInitials(currentAccount.name || "User");
      const createdDoc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          accountId: currentAccount.$id,
          name: currentAccount.name || "User",
          email: currentAccount.email,
          username: (currentAccount.name || "user")
            .toLowerCase()
            .replace(/\s+/g, ""),
          imageUrl: avatarUrl.toString(),
        }
      );
      if (createdDoc) {
        const userSaves = await getUserSaves(createdDoc.$id, currentAccount.$id);
        return {
          ...(createdDoc as unknown as IAppwriteUser),
          save: userSaves,
        };
      }
    } catch (createError) {
      console.warn("Could not create user document in DB:", createError);
    }

    // Fallback: Return a valid user object from currentAccount so auth never crashes
    const avatarUrl = avatars.getInitials(currentAccount.name || "User");
    const userSaves = await getUserSaves(currentAccount.$id);
    return {
      $id: currentAccount.$id,
      $collectionId: appwriteConfig.userCollectionId,
      $databaseId: appwriteConfig.databaseId,
      $createdAt: currentAccount.$createdAt,
      $updatedAt: currentAccount.$updatedAt,
      $permissions: [],
      accountId: currentAccount.$id,
      name: currentAccount.name || "User",
      username: (currentAccount.name || "user")
        .toLowerCase()
        .replace(/\s+/g, ""),
      email: currentAccount.email,
      imageUrl: avatarUrl.toString(),
      bio: "",
      save: userSaves,
      liked: [],
    } as unknown as IAppwriteUser;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// ============================== GET USER SAVES
export async function getUserSaves(userDocId: string, accountId?: string) {
  try {
    const queries = [
      Query.equal("user", userDocId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ];

    let savesRes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      queries
    );

    // If no saves found with userDocId and accountId is provided, check accountId as well
    if (
      (!savesRes || savesRes.documents.length === 0) &&
      accountId &&
      accountId !== userDocId
    ) {
      try {
        const altRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.savesCollectionId,
          [Query.equal("user", accountId), Query.orderDesc("$createdAt"), Query.limit(100)]
        );
        if (altRes && altRes.documents.length > 0) {
          savesRes = altRes;
        }
      } catch {}
    }

    if (!savesRes || !savesRes.documents) return [];

    const populatedSaves = await Promise.all(
      savesRes.documents.map(async (saveDoc) => {
        const postId =
          typeof saveDoc.post === "object" && saveDoc.post !== null
            ? saveDoc.post.$id
            : saveDoc.post;

        if (!postId) return null;

        try {
          const postDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
          );
          return {
            ...saveDoc,
            post: formatPost(postDoc),
          };
        } catch {
          return {
            ...saveDoc,
            post: null,
          };
        }
      })
    );

    return populatedSaves.filter(Boolean);
  } catch (err) {
    console.warn("getUserSaves error:", err);
    return [];
  }
}

// ============================== SIGN OUT

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error("signOutAccount error:", error);
  }
}

// ============================================================
// POSTS
// ============================================================

export function formatPost(post: any): IPost {
  if (!post) return post;

  let imageUrl = post.imageUrl;
  // If imageUrl has Appwrite transformation URL (/preview) that is blocked on free tier, convert to /view
  if (typeof imageUrl === "string" && imageUrl.includes("/preview")) {
    imageUrl = imageUrl.replace("/preview", "/view");
  }
  if (post.imageId && (!imageUrl || imageUrl.includes("/preview"))) {
    try {
      imageUrl = getFilePreview(post.imageId);
    } catch {}
  }

  // Appwrite may return creator/Creator as a populated object OR as a plain string ID
  // Normalize to always have a creator object with at least a $id
  const rawCreator = post.creator || post.Creator;
  const creator =
    rawCreator && typeof rawCreator === "object"
      ? rawCreator
      : rawCreator && typeof rawCreator === "string"
      ? { $id: rawCreator, imageUrl: "", name: "", username: "" }
      : undefined;

  return {
    ...post,
    imageUrl,
    creator,
    Creator: creator,
  };
}

export function formatPosts(posts: any) {
  if (!posts || !Array.isArray(posts.documents)) return posts;
  return {
    ...posts,
    documents: posts.documents.map(formatPost),
  };
}

// ============================== CREATE POST

export async function createPost(post: INewPost) {
  let uploadedFileId: string | null = null;
  try {
    if (!post.file || post.file.length === 0 || !post.file[0]) {
      throw new Error("Please select an image file to upload.");
    }

    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw new Error("File upload failed");
    uploadedFileId = uploadedFile.$id;

    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw new Error("Could not generate file preview URL");
    }

    const tags = post.tags
      ? post.tags.replace(/ /g, "").split(",").filter(Boolean)
      : [];

    // Ensure we have the user document ID in the users collection
    let userDocId = post.userId;
    try {
      const userDocs = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", post.userId)]
      );
      if (userDocs && userDocs.documents.length > 0) {
        userDocId = userDocs.documents[0].$id;
      }
    } catch {
      // Proceed with post.userId as fallback
    }

    const postPayload = {
      caption: post.caption,
      imageUrl: fileUrl,
      imageId: uploadedFile.$id,
      location: post.location || "",
      tags,
    };

    // The collection schema uses 'Creator' (capital C). We support both seamlessly.
    let newPost;
    try {
      newPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        ID.unique(),
        {
          ...postPayload,
          Creator: userDocId,
        }
      );
    } catch (createErr: any) {
      if (
        createErr?.message?.includes('Unknown attribute: "Creator"') ||
        createErr?.message?.includes("Attribute not found")
      ) {
        newPost = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.postCollectionId,
          ID.unique(),
          {
            ...postPayload,
            creator: userDocId,
          }
        );
      } else {
        throw createErr;
      }
    }

    return formatPost(newPost);
  } catch (error: any) {
    console.error("createPost error:", error);
    // Clean up uploaded file if DB write failed
    if (uploadedFileId) {
      try { await deleteFile(uploadedFileId); } catch {}
    }
    throw error;
  }
}

// ============================== UPLOAD FILE

export async function uploadFile(file: File) {
  try {
    if (!file) {
      throw new Error("No file provided for upload.");
    }

    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (error: any) {
    console.error("uploadFile error:", error);
    if (
      error?.code === 401 ||
      error?.message?.toLowerCase().includes("permissions") ||
      error?.type === "user_unauthorized"
    ) {
      throw new Error(
        "Appwrite Storage bucket requires Create permission. In your Appwrite Console, go to Storage > select bucket '6ab7e0ed003942821b13' > Settings > Permissions, and add Create & Read permissions for 'Any' or 'All Users'."
      );
    }
    throw error;
  }
}

// ============================== GET FILE PREVIEW URL

export function getFilePreview(fileId: string): string {
  if (!fileId) return "";
  return storage.getFileView({
    bucketId: appwriteConfig.storageId,
    fileId,
  });
}

export function getFileViewUrl(fileId: string): string {
  return storage.getFileView({
    bucketId: appwriteConfig.storageId,
    fileId,
  });
}

// ============================== DELETE FILE

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error: any) {
    console.error("deleteFile error:", error);
    throw error;
  }
}

// ============================== GET POSTS

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments<IPost>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return formatPosts(posts);
  } catch (error) {
    console.error("searchPosts error:", error);
    return { total: 0, documents: [] } as any;
  }
}

// ============================== GET INFINITE POSTS

export async function getInfinitePosts({
  pageParam,
}: {
  pageParam: number;
}) {
  const queries: any[] = [
    Query.orderDesc("$updatedAt"),
    Query.limit(9),
  ];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments<IPost>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return formatPosts(posts);
  } catch (error) {
    console.error("getInfinitePosts error:", error);
    return { total: 0, documents: [] } as any;
  }
}

// ============================== GET POST BY ID

export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument<IPost>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return formatPost(post);
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;
  let newFileId: string | null = null;

  try {
    let image: { imageUrl: string; imageId: string } = {
      imageUrl: post.imageUrl.toString(),
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw new Error("File upload failed");
      newFileId = uploadedFile.$id;

      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Could not generate file preview URL");
      }

      image = { imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const tags = post.tags
      ? post.tags.replace(/ /g, "").split(",").filter(Boolean)
      : [];

    const updatedPost = await databases.updateDocument<IPost>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location || "",
        tags,
      }
    );

    // Delete old image only after successful update
    if (hasFileToUpdate) {
      try { await deleteFile(post.imageId); } catch {}
    }

    return updatedPost;
  } catch (error: any) {
    console.error("updatePost error:", error);
    // Roll back new upload if DB update failed
    if (newFileId) {
      try { await deleteFile(newFileId); } catch {}
    }
    throw error;
  }
}

// ============================== DELETE POST

export async function deletePost(
  postId?: string,
  imageId?: string
) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST

export async function likePost(
  postId: string,
  likesArray: string[]
) {
  try {
    const cleanLikes = (likesArray || [])
      .map((item: any) => (typeof item === "string" ? item : item?.$id || item?.id || ""))
      .filter(Boolean);

    const updatedPost = await databases.updateDocument<IPost>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: cleanLikes,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log("likePost error:", error);
    throw error;
  }
}

// ============================== GET USER LIKED POSTS

export async function getUserLikedPosts(userId?: string) {
  if (!userId) return [];

  let userDocId = userId;
  try {
    const userDocs = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", userId)]
    );
    if (userDocs && userDocs.documents.length > 0) {
      userDocId = userDocs.documents[0].$id;
    }
  } catch {}

  try {
    const posts = await databases.listDocuments<IPost>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(100)]
    );

    if (!posts || !posts.documents) return [];

    const formatted = formatPosts(posts);
    const liked = formatted.documents.filter((post: any) => {
      const likes = post.likes || [];
      return likes.some((u: any) => {
        const id = typeof u === "string" ? u : u?.$id || u?.id;
        return id === userId || id === userDocId;
      });
    });

    return liked;
  } catch (error) {
    console.error("getUserLikedPosts error:", error);
    return [];
  }
}

// ============================== SAVE POST

export async function savePost(
  userId: string,
  postId: string
) {
  try {
    let userDocId = userId;
    try {
      const userDocs = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", userId)]
      );
      if (userDocs && userDocs.documents.length > 0) {
        userDocId = userDocs.documents[0].$id;
      }
    } catch {}

    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userDocId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE SAVED POST

export async function deleteSavedPost(
  savedRecordId: string
) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POSTS

export async function getUserPosts(userId?: string) {
  if (!userId) return;

  // Resolve accountId to user document ID if needed
  let userDocId = userId;
  try {
    const userDocs = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", userId)]
    );
    if (userDocs && userDocs.documents.length > 0) {
      userDocId = userDocs.documents[0].$id;
    }
  } catch {}

  try {
    const posts = await databases.listDocuments<IPost>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.equal("Creator", userDocId),
        Query.orderDesc("$createdAt"),
      ]
    );

    if (!posts) throw Error;

    return formatPosts(posts);
  } catch (error: any) {
    try {
      const fallbackPosts = await databases.listDocuments<IPost>(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [
          Query.equal("creator", userDocId),
          Query.orderDesc("$createdAt"),
        ]
      );
      return formatPosts(fallbackPosts);
    } catch {
      console.error("getUserPosts error:", error);
      throw error;
    }
  }
}

// ============================== GET RECENT POSTS

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments<IPost>(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.orderDesc("$createdAt"),
        Query.limit(20),
      ]
    );

    if (!posts) throw Error;

    const formatted = formatPosts(posts);

    // If creator came back as just an ID string (relationship not populated),
    // manually fetch the creator documents in a batch
    const needsPopulation = formatted.documents.some(
      (p: any) => p.creator && typeof p.creator === "object" && !p.creator.name
    );

    if (needsPopulation) {
      const creatorIds = [
        ...new Set(
          formatted.documents
            .map((p: any) => p.creator?.$id)
            .filter(Boolean)
        ),
      ] as string[];

      if (creatorIds.length > 0) {
        try {
          const creatorsRes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("$id", creatorIds)]
          );
          const creatorsMap = Object.fromEntries(
            creatorsRes.documents.map((u) => [u.$id, u])
          );
          formatted.documents = formatted.documents.map((p: any) => ({
            ...p,
            creator: creatorsMap[p.creator?.$id] || p.creator,
            Creator: creatorsMap[p.creator?.$id] || p.creator,
          }));
        } catch {
          // Silently fail — posts still render, just without creator names
        }
      }
    }

    return formatted;
  } catch (error) {
    console.error("getRecentPosts error:", error);
    return { total: 0, documents: [] } as any;
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS

export async function getUsers(limit?: number) {
  const queries: any[] = [
    Query.orderDesc("$createdAt"),
  ];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments<IAppwriteUser>(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.error("getUsers error:", error);
    return { total: 0, documents: [] } as any;
  }
}

// ============================== GET USER BY ID

export async function getUserById(userId: string) {
  if (!userId || userId === "undefined") return null;

  try {
    const user = await databases.getDocument<IAppwriteUser>(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== UPDATE USER

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;

  try {
    let image: {
      imageUrl: string;
      imageId: string;
    } = {
      imageUrl: user.imageUrl.toString(),
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);

      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.$id);

      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = {
        ...image,
        imageUrl: fileUrl.toString(),
        imageId: uploadedFile.$id,
      };
    }

    const updatedUser = await databases.updateDocument<IAppwriteUser>(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    if (!updatedUser) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      throw Error;
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}