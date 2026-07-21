import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div>
      <div style={{minHeight:"90vh"}} className=" flex flex-col items-center justify-center text-center px-6 bg-gray-50">
        <Navbar />
        {/* 404 Text */}
        <h1 className="text-6xl font-bold text-gray-800">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold mt-4 text-gray-700">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-500 max-w-md">
          The page you’re looking for doesn’t exist or may have been moved.
          You can go back home or access help below.
        </p>

        {/* Emergency Help */}
        <div className="mt-10 bg-white shadow-md rounded-lg p-5 max-w-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Need immediate help?
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            If you’re in danger, please contact emergency services.
          </p>

          <button className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
            Call Hotline
          </button>
        </div>

      </div>
      <Footer />
</div>
  );
}