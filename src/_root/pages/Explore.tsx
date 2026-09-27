import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import useDebounce from "@/hooks/useDebounce";
import { GridPostList, Loader } from "@/components/shared";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const POPULAR_TAGS = [
  "All",
  "Design",
  "Photography",
  "Art",
  "Nature",
  "Tech",
  "Travel",
];

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return (
      <div className="flex-center w-full py-16">
        <Loader />
      </div>
    );
  } else if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  } else {
    return (
      <div className="flex flex-col items-center justify-center w-full py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-dark-3 border border-white/10 flex items-center justify-center mb-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="no results"
            className="opacity-40 invert-white"
          />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No posts found</h3>
        <p className="text-xs text-light-3 max-w-xs">
          Try searching for different keywords, captions, or popular tags.
        </p>
      </div>
    );
  }
};

const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const debouncedSearch = useDebounce(searchValue, 400);
  const { data: searchedPosts, isFetching: isSearchFetching } =
    useSearchPosts(debouncedSearch);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue, fetchNextPage]);

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    if (tag === "All") {
      setSearchValue("");
    } else {
      setSearchValue(tag.toLowerCase());
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setSelectedTag("All");
  };

  if (!posts) {
    return (
      <div className="flex-center w-full h-full min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts.pages.every((item) => item.documents.length === 0);

  return (
    <div className="explore-container">
      {/* Header & Search Bar */}
      <div className="explore-inner_container">
        <div className="flex flex-col gap-1 w-full text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Explore
          </h2>
          <p className="text-xs md:text-sm text-light-3">
            Search posts, creators, tags, and trending topics
          </p>
        </div>

        {/* Enhanced Search Input */}
        <div className="relative flex items-center w-full rounded-2xl bg-dark-2 border border-white/[0.08] focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20 px-4 py-1.5 transition-all shadow-lg shadow-black/30">
          <img
            src="/assets/icons/search.svg"
            width={20}
            height={20}
            alt="search"
            className="opacity-60"
          />
          <input
            type="text"
            placeholder="Search by caption or tag..."
            className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-light-4 outline-none border-none"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (!e.target.value) setSelectedTag("All");
            }}
          />
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="p-1 rounded-full text-light-3 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear search"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full py-1 no-scrollbar">
          {POPULAR_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                    : "bg-dark-3/80 hover:bg-dark-3 text-light-2 border border-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                {tag === "All" ? "All Posts" : `#${tag}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Section Title */}
      <div className="flex-between w-full max-w-5xl mt-12 mb-6">
        <h3 className="text-lg md:text-xl font-bold text-white">
          {shouldShowSearchResults
            ? `Results for "${searchValue}"`
            : "Popular Today"}
        </h3>
      </div>

      {/* Grid of Posts */}
      <div className="w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">
            No posts found
          </p>
        ) : (
          posts.pages.map((item, index) => (
            <GridPostList key={`page-${index}`} posts={item.documents} />
          ))
        )}
      </div>

      {/* Infinite Scroll Loader */}
      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-12 py-4 flex-center w-full">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;