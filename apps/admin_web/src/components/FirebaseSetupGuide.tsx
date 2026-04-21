import React from 'react';
import { AlertTriangle, Copy, ExternalLink } from 'lucide-react';

const FirebaseSetupGuide: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-full mr-4">
              <AlertTriangle className="w-7 h-7 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Firebase chưa được cấu hình</h1>
          </div>

          <p className="text-gray-600 mb-6 text-center">
            Để sử dụng ứng dụng, bạn cần thiết lập Firebase credentials trong file `.env.local`
          </p>

          {/* Steps */}
          <div className="space-y-6 mb-8">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Bước 1: Tạo Firebase Project</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Truy cập <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
                <li>Tạo project mới: <strong>AquaCareSystem</strong></li>
                <li>Ghi lại Project ID (ví dụ: <code className="bg-gray-100 px-2 py-1 rounded">aquacarsystem-abc123</code>)</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">🌐 Bước 2: Tạo Web App</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Trong Firebase Console, chọn <strong>"Add app"</strong> → <strong>Web</strong> (icon &lt;/&gt;)</li>
                <li>Đặt tên: <strong>Admin Web</strong></li>
                <li>Copy cấu hình JSON được cung cấp</li>
              </ol>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">⚙️ Bước 3: Cấu hình .env.local</h3>
              <p className="text-sm text-gray-600 mb-3">Cập nhật file <code className="bg-gray-100 px-2 py-1 rounded">apps/admin_web/.env.local</code> với giá trị từ Firebase:</p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-700 font-mono">
                    VITE_FIREBASE_API_KEY=your_api_key_here
                  </code>
                  <button
                    onClick={() => copyToClipboard('VITE_FIREBASE_API_KEY=')}
                    className="text-gray-500 hover:text-gray-700"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-700 font-mono">
                    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
                  </code>
                  <button
                    onClick={() => copyToClipboard('VITE_FIREBASE_AUTH_DOMAIN=')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-700 font-mono">
                    VITE_FIREBASE_PROJECT_ID=your_project_id
                  </code>
                  <button
                    onClick={() => copyToClipboard('VITE_FIREBASE_PROJECT_ID=')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-700 font-mono">
                    VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
                  </code>
                  <button
                    onClick={() => copyToClipboard('VITE_FIREBASE_STORAGE_BUCKET=')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-700 font-mono">
                    VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
                  </code>
                  <button
                    onClick={() => copyToClipboard('VITE_FIREBASE_MESSAGING_SENDER_ID=')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-700 font-mono">
                    VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
                  </code>
                  <button
                    onClick={() => copyToClipboard('VITE_FIREBASE_APP_ID=')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Bước 4: Khởi động lại dev server</h3>
              <p className="text-sm text-gray-600">Sau khi cập nhật `.env.local`, khởi động lại terminal dev server:</p>
              <code className="block bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs font-mono">
                npm run dev
              </code>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              Tài liệu hướng dẫn
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Xem hướng dẫn chi tiết tại: <code className="bg-white px-2 py-1 rounded">docs/FIREBASE_SETUP.md</code>
              </li>
              <li>
                • Firebase Console: <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold">console.firebase.google.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSetupGuide;
