import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client, appwriteConfig } from "@/lib/appwrite/config";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!appwriteConfig.databaseId || !appwriteConfig.postCollectionId) return;

    const channels = [
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.postCollectionId}.documents`,
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.userCollectionId}.documents`,
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.savesCollectionId}.documents`,
    ];

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = client.subscribe(channels, (response) => {
        const events = response.events || [];
        const payload: any = response.payload;

        const isPostEvent = events.some((e) =>
          e.includes(appwriteConfig.postCollectionId)
        );
        const isUserEvent = events.some((e) =>
          e.includes(appwriteConfig.userCollectionId)
        );
        const isSaveEvent = events.some((e) =>
          e.includes(appwriteConfig.savesCollectionId)
        );

        if (isPostEvent) {
          // Real-time Likes & Post updates
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_POSTS],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_USER_POSTS],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_USER_LIKED_POSTS],
          });

          if (payload?.$id) {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_POST_BY_ID, payload.$id],
            });
          }
        }

        if (isSaveEvent) {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_CURRENT_USER],
          });
        }

        if (isUserEvent) {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_USERS],
          });
          if (payload?.$id) {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_USER_BY_ID, payload.$id],
            });
          }
        }
      });
    } catch (err) {
      console.warn("Could not establish Appwrite realtime subscription:", err);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [queryClient]);
}
