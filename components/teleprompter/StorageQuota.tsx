/**
 * StorageQuota Component
 * Displays user's storage usage with visual progress bar and warnings
 */

'use client';

import React, { useEffect, useState } from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStorageQuota } from '@/lib/supabase/recordings';
import type { StorageQuota as StorageQuotaType } from '@/types/recording';

interface StorageQuotaProps {
  className?: string;
}

export function StorageQuota({ className }: StorageQuotaProps) {
  const [quota, setQuota] = useState<StorageQuotaType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuota();
  }, []);

  const loadQuota = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStorageQuota();
      setQuota(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load storage info');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className} bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-2 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quota) {
    return null;
  }

  const getWarningLevel = () => {
    if (quota.usage_percentage >= 90) return 'critical';
    if (quota.usage_percentage >= 75) return 'warning';
    return 'normal';
  };

  const warningLevel = getWarningLevel();

  const warningStyles = {
    critical: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-300',
      bar: 'bg-red-500',
      icon: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-300',
      bar: 'bg-yellow-500',
      icon: 'text-yellow-400',
    },
    normal: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-300',
      bar: 'bg-blue-500',
      icon: 'text-blue-400',
    },
  };

  const styles = warningStyles[warningLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className} ${styles.bg} backdrop-blur rounded-xl p-4 border ${styles.border}`}
    >
      <div className="flex items-start gap-3">
        <HardDrive className={`${styles.icon} flex-shrink-0 mt-0.5`} size={20} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Storage Usage</h3>
            <span className={`text-xs font-medium ${styles.text}`}>
              {quota.usage_percentage.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-black/30 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(quota.usage_percentage, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`absolute top-0 left-0 h-full ${styles.bar}`}
            />
          </div>

          {/* Storage Details */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {quota.used_mb.toFixed(1)} MB of {quota.limit_mb} MB used
            </span>
            <span>
              {(quota.limit_mb - quota.used_mb).toFixed(1)} MB remaining
            </span>
          </div>

          {/* Warning Message */}
          {warningLevel === 'critical' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-300">
              <AlertTriangle size={14} />
              <span>
                Storage almost full! Delete old recordings or upgrade your plan.
              </span>
            </div>
          )}
          {warningLevel === 'warning' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-300">
              <AlertTriangle size={14} />
              <span>
                Running low on storage. Consider managing your recordings.
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
