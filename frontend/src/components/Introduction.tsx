//Introduction.tsx
type Props = {
  onStart: () => void;
};

export default function Introduction({ onStart }: Props) {
  return (
    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      <div className="text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
          WELCOME TO JCU IDEAS LAB
        </h1>

        <p className="mt-8 text-lg font-medium text-gray-500 sm:text-xl/8">
          Translate research expertise into innovations that generate jobs and
          foster economic growth for Cairns and the broader region.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={onStart}
            className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Start here
          </button>
        </div>
      </div>
    </div>
  );
}