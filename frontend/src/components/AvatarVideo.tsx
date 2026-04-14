import { useEffect, useState } from "react";

type Props = {
  videoUrl: string;
  loading: boolean;
  error: string;
  cached: boolean;
  onBack: () => void;
};

export default function AvatarVideo({
  videoUrl,
  loading,
  error,
  onBack,
}: Props) {
  // Current video being played
  const [currentVideo, setCurrentVideo] = useState("");

  // Whether user is leaving (used to trigger back after video ends)
  const [isLeaving, setIsLeaving] = useState(false);

  // Sync video when parent updates videoUrl
  useEffect(() => {
    setCurrentVideo(videoUrl);
    setIsLeaving(false);
  }, [videoUrl]);

  // Fetch video from backend (intro or bye)
  const fetchVideo = async (type: "intro" | "bye") => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/video/${type}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch video.");
      }

      if (!data.video_url) {
        throw new Error("No video_url returned from backend.");
      }

      // Update video source
      setCurrentVideo(data.video_url);
    } catch {
      // Error handling (kept minimal)
    }
  };

  // Play introduction video
  const handleIntroduce = async () => {
    setIsLeaving(false);
    await fetchVideo("intro");
  };

  // Play goodbye video and prepare to go back
  const handleBackClick = async () => {
    setIsLeaving(true);
    await fetchVideo("bye");
  };

  // After video ends, trigger back if leaving
  const handleVideoEnded = () => {
    if (isLeaving) {
      onBack();
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-16 text-center">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        JCU IDEAS LAB Assistant
      </h1>

      {/* Loading state */}
      {loading && (
        <div className="py-10">
          <p className="text-lg text-gray-600">
            Generating avatar video...
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="py-10">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      )}

      {/* Video display */}
      {!loading && !error && currentVideo && (
        <div className="flex flex-col items-center gap-4">
          <video
            key={currentVideo} // force reload when URL changes
            width="420"
            controls
            autoPlay
            onEnded={handleVideoEnded}
            className="rounded-xl shadow-lg"
          >
            <source src={currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleIntroduce}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Introduce myself
        </button>

        <button
          onClick={handleBackClick}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}