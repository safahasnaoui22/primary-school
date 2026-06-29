import InstallButton from "./components/InstallButton";


export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🏫 Primary School</h1>
        <p className="text-gray-600 mb-6">Welcome to your school management dashboard</p>
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-2">Install this app on your device for quick access</p>
          <InstallButton />
        </div>
      </div>
    </main>
  );
}