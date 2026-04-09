import { useState } from "react";
import Introduction from "./Introduction";
import AvatarVideo from "./AvatarVideo";

export default function Background() {
  const [started, setStarted] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cached, setCached] = useState(false);

  const handleStart = async () => {
    console.log(">>> 点击了 Start here");

    setStarted(true);
    setLoading(true);
    setError("");
    setVideoUrl("");
    setCached(false);

    try {
      console.log(">>> 准备请求后端 /video/welcome");

      const res = await fetch("http://127.0.0.1:8000/video/welcome", {
        method: "POST",
      });

      console.log(">>> 后端响应状态码：", res.status);

      const data = await res.json();
      console.log(">>> 后端返回数据：", data);

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail) || "Failed to generate video."
        );
      }

      if (!data.video_url) {
        throw new Error("No video_url returned from backend.");
      }

      setVideoUrl(data.video_url);
      setCached(!!data.cached);
    } catch (err) {
      console.error(">>> 前端捕获到错误：", err);
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    console.log(">>> 点击了 Back");
    setStarted(false);
    setLoading(false);
    setError("");
    setVideoUrl("");
    setCached(false);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* 顶部渐变背景 */}
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

        {/* 底部渐变背景 */}
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