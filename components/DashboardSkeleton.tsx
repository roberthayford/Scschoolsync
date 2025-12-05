import React from 'react';
import { Skeleton } from './Skeleton';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto pb-20 lg:pb-0">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton width={200} height={32} className="mb-2" />
                    <Skeleton width={150} height={20} />
                </div>
                <Skeleton variant="circular" width={40} height={40} />
            </div>

            {/* Stats/Action Banner Skeleton */}
            <div className="mb-8">
                <Skeleton height={120} className="w-full rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} width={80} height={32} className="rounded-full shrink-0" />
                        ))}
                    </div>

                    {/* Timeline Items */}
                    <div className="space-y-4">
                        {/* Day Header */}
                        <Skeleton width={120} height={24} className="mb-4" />

                        {/* Cards */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
                                <div className="w-1 bg-slate-200 rounded-full"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between">
                                        <Skeleton width="60%" height={24} />
                                        <Skeleton width={40} height={20} />
                                    </div>
                                    <Skeleton width="40%" height={16} />
                                    <div className="flex gap-2 mt-2">
                                        <Skeleton width={60} height={20} className="rounded-full" />
                                        <Skeleton width={80} height={20} className="rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Assistant Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton width={100} height={24} />
                        </div>
                        <Skeleton width="100%" height={16} className="mb-2" />
                        <Skeleton width="80%" height={16} className="mb-4" />
                        <Skeleton width="100%" height={40} className="rounded-xl" />
                    </div>

                    {/* Monthly Overview */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <Skeleton width={140} height={24} className="mb-4" />
                        <Skeleton width="100%" height={200} className="rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
