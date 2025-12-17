"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Crown,
  Shield,
  ArrowLeft,
  CheckCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabaseBrowser } from "@/lib/auth/supabaseBrowser";
import SupabaseUserIcon from "@/app/chat/components/SupabaseUserIcon";

export default function DemoPage() {
  const { user, loading } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<"normal" | "pro" | "admin">(
    "normal"
  );

  const demoUsers = [
    {
      level: "normal" as const,
      name: "Nguyễn Văn A",
      email: "user@example.com",
      password: "user123",
      description: "Người dùng cơ bản",
      features: ["Truy cập cơ bản", "Tìm kiếm văn bản", "Chat AI cơ bản"],
    },
    {
      level: "pro" as const,
      name: "Trần Thị B",
      email: "pro@example.com",
      password: "pro123",
      description: "Người dùng cao cấp",
      features: [
        "Tất cả tính năng Normal",
        "Phân tích hợp đồng",
        "Soạn thảo văn bản",
        "Hỗ trợ ưu tiên",
      ],
    },
    {
      level: "admin" as const,
      name: "Admin ViLaw",
      email: "admin@vilaw.com",
      password: "admin123",
      description: "Quản trị viên hệ thống",
      features: [
        "Tất cả tính năng Pro",
        "Quản lý hệ thống",
        "Báo cáo chi tiết",
        "Quản lý người dùng",
      ],
    },
  ];
  useEffect(() => {
    if (user) {
      // Determine user level based on email or user metadata
      const email = user.email || "";
      if (email.includes("admin")) {
        setCurrentLevel("admin");
      } else if (email.includes("pro")) {
        setCurrentLevel("pro");
      } else {
        setCurrentLevel("normal");
      }
    } else {
      setCurrentLevel("normal");
    }
  }, [user]);

  const setDemoUser = async (level: "normal" | "pro" | "admin") => {
    const demoUser = demoUsers.find((u) => u.level === level);
    if (!demoUser) return;

    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoUser.email,
        password: demoUser.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setCurrentLevel(level);
        toast.success(`Đã chuyển sang ${demoUser.name} (${level})`);
        // Reload page to show user icon
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể đăng nhập tài khoản demo";
      toast.error(message);
    }
  };

  const clearUser = async () => {
    try {
      const supabase = supabaseBrowser();
      await supabase.auth.signOut();
      toast.success("Đã xóa thông tin người dùng");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Không thể đăng xuất demo", error);
      toast.error("Không thể xóa thông tin. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100">
      {/* Supabase User Icon */}
      <SupabaseUserIcon mode="floating" />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Demo User Icon
              </h1>
              <p className="text-sm text-gray-500">
                Thử nghiệm tính năng User Icon với các level khác nhau
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Hướng dẫn sử dụng
              </h3>
              <p className="text-blue-800 mb-3">
                Chọn một trong các tài khoản demo bên dưới để thử nghiệm User
                Icon. Icon sẽ xuất hiện ở góc trên bên phải màn hình sau khi
                đăng nhập.
              </p>
              <div className="space-y-1 text-sm text-blue-700">
                <p>
                  • <strong>Normal User:</strong> Người dùng cơ bản
                </p>
                <p>
                  • <strong>Pro User:</strong> Người dùng cao cấp (có Crown
                  icon)
                </p>
                <p>
                  • <strong>Admin:</strong> Quản trị viên (có Shield icon)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Users */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {demoUsers.map((user, index) => (
            <motion.div
              key={user.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                currentLevel === user.level
                  ? "border-primary-300 bg-primary-50"
                  : "border-gray-200"
              }`}
              onClick={() => setDemoUser(user.level)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    user.level === "pro"
                      ? "bg-yellow-100"
                      : user.level === "admin"
                      ? "bg-red-100"
                      : "bg-gray-100"
                  }`}
                >
                  {user.level === "pro" ? (
                    <Crown className="w-6 h-6 text-yellow-600" />
                  ) : user.level === "admin" ? (
                    <Shield className="w-6 h-6 text-red-600" />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{user.description}</p>

              <div className="space-y-2">
                {user.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setDemoUser(user.level)}
                className="w-full mt-4 btn-primary"
              >
                Chọn tài khoản này
              </button>
            </motion.div>
          ))}
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trạng thái hiện tại
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentLevel === "normal" ? (
                <User className="w-6 h-6 text-gray-600" />
              ) : currentLevel === "pro" ? (
                <Crown className="w-6 h-6 text-yellow-600" />
              ) : (
                <Shield className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {demoUsers.find((u) => u.level === currentLevel)?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Level: {currentLevel.toUpperCase()}
                </p>
              </div>
            </div>

            <button
              onClick={clearUser}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Xóa thông tin
            </button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            So sánh các gói
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Tính năng
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    Normal
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    Pro
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    Admin
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Tìm kiếm văn bản</td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Chat AI</td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">
                    Phân tích hợp đồng
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Soạn thảo văn bản</td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Quản lý hệ thống</td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center text-gray-400">—</td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
