'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Shield,
    CheckCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import type { RecentUser } from '@/services/dashboard.service';

interface RecentUsersTableProps {
    users: RecentUser[];
    showViewAll?: boolean;
}

export default function RecentUsersTable({ users, showViewAll = true }: RecentUsersTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && user.isActive) ||
            (filterStatus === 'inactive' && !user.isActive);
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Người dùng gần đây</h3>
                        <p className="text-sm text-slate-500">Danh sách người dùng mới nhất</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-100 border border-slate-600 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-48"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="bg-gray-100 border border-slate-600 text-slate-900 text-sm rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Chưa kích hoạt</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100/50">
                        <tr>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                Người dùng
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                Vai trò
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                Trạng thái
                            </th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                Ngày tạo
                            </th>
                            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="text-slate-500">
                                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Không tìm thấy người dùng nào</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, index) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.05 }}
                                    className="hover:bg-gray-100/30 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-slate-900 font-semibold">
                                                {user.email?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {user.username || 'Chưa đặt tên'}
                                                </p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : 'bg-slate-600/50 text-slate-600'
                                                }`}
                                        >
                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                        >
                                            {user.isActive ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    Hoạt động
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-3 h-3" />
                                                    Chờ kích hoạt
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {showViewAll && filteredUsers.length > 0 && (
                <div className="p-4 border-t border-gray-200 text-center">
                    <Link
                        href="/admin/dashboard/users"
                        className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                    >
                        Xem tất cả người dùng →
                    </Link>
                </div>
            )}
        </motion.div>
    );
}
