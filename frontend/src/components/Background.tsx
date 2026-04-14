import { useState } from "react";
import Introduction from "./Introduction";
import AvatarVideo from "./AvatarVideo";

export default function Background() {
  // State management
  const [started, setStarted] = useState(false); // whether user entered video page
  const [videoUrl, setVideoUrl] = useState(""); // video URL from backend
  const [loading, setLoading] = useState(false); // loading state
  const [error, setError] = useState(""); // error message (not used in minimal version)
  const [cached, setCached] = useState(false); // whether video is cached

  // Trigger when user clicks "Start here"
  const handleStart = () => {
    setStarted(true);
    setLoading(true);
    setError("");
    setVideoUrl("");
    setCached(false);

    // Call backend API to generate welcome video
    fetch("http://127.0.0.1:8000/video/welcome", {
      method: "POST",
    })
      .then((res) => res.json()) // parse response
      .then((data) => {
        setVideoUrl(data.video_url || ""); // set video URL
        setCached(!!data.cached); // set cache flag
        setLoading(false); // stop loading
      });
  };

  // Trigger when user clicks "Back"
  const handleBack = () => {
    setStarted(false); // go back to introduction page
    setLoading(false);
    setError("");
    setVideoUrl("");
    setCached(false);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* Top gradient background */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          />
        </div>

        {/* Conditional rendering */}
        {!started ? (
          <Introduction onStart={handleStart} />
        ) : (
          <AvatarVideo
            videoUrl={videoUrl}
            loading={loading}
            error={error}
            cached={cached}
            onBack={handleBack}
          />
        )}

        {/* Bottom gradient background */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72rem]"
          />
        </div>
      </div>
    </div>
  );
}