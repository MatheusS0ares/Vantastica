import type { SupabaseClient } from "@supabase/supabase-js";

export type VehicleLocation = {
  latitude: number;
  longitude: number;
  updatedAt: string;
};

export async function getVehicleLocation(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<VehicleLocation | null> {
  const { data } = await supabase
    .from("vehicle_locations")
    .select("latitude, longitude, updated_at")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) return null;

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    updatedAt: data.updated_at,
  };
}
