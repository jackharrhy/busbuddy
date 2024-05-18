import { Map } from "~/components/Map";

export default function Index() {
  return (
    <>
      <div className="flex justify-center items-center w-full h-32 bg-black/50 backdrop-blur">
        <div className="bg-white p-4 shadow-xl rounded">
          <h1 className="text-3xl font-bold">metrosux</h1>
        </div>
      </div>
      <Map />
    </>
  );
}
