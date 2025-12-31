/**
 * Recordings Library Page
 * Main dashboard page for managing user recordings
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RecordingsLibrary } from '@/components/Recordings/RecordingsLibrary';

export default async function RecordingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard/recordings');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Recordings Library</h1>
          <p className="text-gray-400 mt-1">
            Manage your video recordings
          </p>
        </div>
      </div>

      {/* Recordings Library with Enhanced Features */}
      <RecordingsLibrary
        showFilters={true}
        enableBulkActions={true}
        initialSort="created_at"
        initialSortOrder="desc"
      />
    </div>
  );
}
