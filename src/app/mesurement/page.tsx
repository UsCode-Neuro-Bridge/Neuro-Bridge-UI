import HandTracker from "@/components/HandTracker";

const Measurement = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">손동작 측정</h1>
        <p className="text-lg text-gray-600 mt-2">
          웹캠을 켜고 카메라에 손바닥을 보여주세요.
        </p>
      </div>

      <HandTracker />
    </main>
  );
};

export default Measurement;
