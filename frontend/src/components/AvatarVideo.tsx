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
  const [currentVideo, setCurrentVideo] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setCurrentVideo(videoUrl);
    setIsLeaving(false);
  }, [videoUrl]);

  const fetchVideo = async (type: "intro" | "bye") => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/video/${type}`, {
        method: "POST",
      });

      const data = await res.json();
      console.log(`>>> ${type} video response:`, data);

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch video.");
      }

      if (!data.video_url) {
        throw new Error("No video_url returned from backend.");
      }

      setCurrentVideo(data.video_url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIntroduce = async () => {
    setIsLeaving(false);
    await fetchVideo("intro");
  };

  const handleBackClick = async () => {
    setIsLeaving(true);
    await fetchVideo("bye");
  };

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

      {loading && (
        <div className="py-10">
          <p className="text-lg text-gray-600">Generating avatar video...</p>
        </div>
      )}

      {!loading && error && (
        <div className="py-10">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && currentVideo && (
        <div className="flex flex-col items-center gap-4">

          <video
            key={currentVideo}
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