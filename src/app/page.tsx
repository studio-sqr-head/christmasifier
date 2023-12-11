"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/solid";

interface Profile {
  display_name: string;
  images: { url: string }[];
  followers: { total: number };
}

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
}

const useGetMe = (token?: string | null) => {
  const [me, setMe] = useState<Profile | null>(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => setMe(data))
        .catch((error) => setError(error))
        .finally(() => setIsLoading(false));
    }
  }, [token]);
  if (!token) return { me: null, error: null, isLoading: false };
  return { me, error, isLoading };
};

const useGetTopTracks = (token?: string | null) => {
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetch("https://api.spotify.com/v1/me/top/tracks", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => setTopTracks(data.items))
        .catch((error) => setError(error))
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  if (!token) return { topTracks: [], error: null, isLoading: false };

  return { topTracks, error, isLoading };
};

interface Item {
  album: {
    album_type: string;
    total_tracks: number;
    available_markets: string[];
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
    name: string;
    release_date: string;
    release_date_precision: string;
    restrictions: {
      reason: string;
    };
    type: string;
    uri: string;
    artists: {
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      name: string;
      type: string;
      uri: string;
    }[];
  };
  artists: {
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string;
      total: number;
    };
    genres: string[];
    href: string;
    id: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
    name: string;
    popularity: number;
    type: string;
    uri: string;
  }[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
    ean: string;
    upc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: {};
  restrictions: {
    reason: string;
  };
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

interface SearchResults {
  tracks: {
    href: string;
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
    items: Item[];
  };
}

const useSearchTracks = (
  token?: string | null,
  searchQuery?: string | null,
  type: string | null = "track"
) => {
  const [searchResults, setSearchResults] = useState<SearchResults>({
    tracks: {
      href: "",
      limit: 0,
      next: "",
      offset: 0,
      previous: "",
      total: 0,
      items: [],
    },
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && searchQuery != null && searchQuery?.length > 0) {
      setIsLoading(true);
      fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => setSearchResults(data))
        .catch((error) => setError(error))
        .finally(() => setIsLoading(false));
    }
  }, [searchQuery, token, type]);

  if (!token) return { searchResults: null, error: null, isLoading: false };

  return { searchResults, error, isLoading };
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    toggleDropdown();

    router.push("/");
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const { me, error, isLoading } = useGetMe(token);
  const {
    topTracks,
    error: tracksError,
    isLoading: tracksLoading,
  } = useGetTopTracks(token);
  const {
    searchResults,
    error: searchError,
    isLoading: searchLoading,
  } = useSearchTracks(token, searchQuery);

  useEffect(() => {
    // listen for enter key and if search query is not empty, open modal

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && searchQuery.length > 0) {
        setIsSearchModalOpen(true);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isSearchModalOpen, searchQuery]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* topbar sticky */}
      <div className="flex justify-between w-full p-2 text-white sticky top-0">
        <a href="#" className="text-xl font-bold">
          Christmasifier
        </a>

        {/* search */}

        <div className="flex items-center justify-center space-x-4 rounded-full bg-gray-100 dark:bg-gray-800 p-2">
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search"
            className="w-64 p-2 rounded-full bg-gray-100 dark:bg-gray-800"
          />

          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="rounded-full bg-gray-100 dark:bg-gray-800 p-2"
          >
            <MagnifyingGlassCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* modal */}

        {isSearchModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full backdrop-filter backdrop-blur-sm backdrop-saturate-150 background-blend-mode: luminosity">
            <div className="relative top-20 mx-auto p-5 shadow-lg rounded-md bg-white dark:bg-gray-800 w-3/4 md:w-1/2 border-1 border-gray-900 dark:border-gray-900">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Search results for &quot;{searchQuery}&quot;
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300">
                    {searchResults?.tracks?.total} results
                  </p>
                </div>

                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-hide="default-modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              <div className="relative p-4 md:p-5 flex-auto">
                {/* Modal Content */}
                {searchLoading && <p>Loading...</p>}
                {searchError && <p>Error: {searchError}</p>}

                {/* grid */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {searchResults?.tracks?.items?.map(
                    ({
                      artists,
                      album,
                      name,
                      popularity,
                      preview_url,
                      uri,
                      href,
                    }) => {
                      return (
                        // cards
                        <div
                          className="flex flex-row p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                          key={uri}
                        >
                          <div className="flex flex-col justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={album?.images?.[0].url}
                              alt="album cover"
                              className="rounded-lg shadow-md mb-4"
                              width={100}
                              height={100}
                            />
                          </div>

                          <div className="ml-4 text-left">
                            <h2 className="text-xl font-medium text-gray-800 dark:text-white">
                              {name}
                            </h2>
                            <p className="mt-2">{artists?.[0].name}</p>
                            <p className="text-gray-600 dark:text-gray-300">
                              Popularity: {popularity}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {me ? (
          <>
            <div className="relative flex space-x-4 items-center justify-center">
              <button
                className="flex items-center text-sm pe-1 font-medium text-gray-900 rounded-full hover:text-blue-600 dark:hover:text-blue-500 md:me-0 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-white"
                type="button"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label="Open user menu"
                ref={dropdownRef}
                onClick={toggleDropdown}
              >
                <span className="sr-only">Open user menu</span>
                <Image
                  src={me?.images?.[1].url}
                  width={40}
                  height={40}
                  className="rounded-full"
                  alt="profile picture"
                />
                {me?.display_name}
                <svg
                  className="w-2.5 h-2.5 ms-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
            </div>

            <div
              id="dropdown"
              className={`${
                isOpen ? "block" : "hidden"
              } origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 dark:bg-gray-800`}
            >
              <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                <div className="font-medium ">{me?.display_name}</div>
                <div className="truncate">{me?.followers?.total} followers</div>
              </div>

              <div className="py-2">
                <a
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                >
                  Sign out
                </a>
              </div>
            </div>
          </>
        ) : (
          <button
            className="text-xl font-bold hover:underline hover:text-gray-400"
            onClick={() => {
              router.push("/api/login");
            }}
          >
            Login
          </button>
        )}
      </div>
      <div className="flex flex-col items-center justify-center w-full p-24">
        {me && (
          <div>
            <h1 className="text-4xl font-bold">
              Welcome back, {me?.display_name}!
            </h1>
          </div>
        )}
      </div>
    </main>
  );
}

const SpotifyPlayer = ({ token: string }) => {
  useEffect(() => {
    if (window.Spotify) {
      initializeSpotifyPlayer(token);
    } else {
      // Load Spotify Web Playback SDK script and then initialize the player
    }
  }, []);

  const initializeSpotifyPlayer = (token) => {
    // Spotify Web Playback SDK initialization and event handling
  };

  // Render controls and other UI components
  return <div>{/* Player controls */}</div>;
};
