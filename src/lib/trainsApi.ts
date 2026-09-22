import { getApiBaseUrl } from "./api";

export type StationInfo = {
  code: string;
  name: string;
  city: string;
  state: string;
};

export type TrainClassAvailability = {
  travel_class: string;
  class_name: string;
  fare: number;
  status: string;
  status_type: "AVAILABLE" | "RAC" | "WL";
};

export type TrainScheduleItem = {
  train_number: string;
  train_name: string;
  train_type: string;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  running_days: string[];
  classes: TrainClassAvailability[];
  has_pantry: boolean;
};

export type PassengerInput = {
  name: string;
  age: number;
  gender: string;
  berth_preference?: string;
};

export type TrainBookingPayload = {
  train_number: string;
  train_name: string;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  journey_date: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  travel_class: string;
  quota: string;
  passengers: PassengerInput[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  idempotency_key?: string;
};

export type TrainPassenger = {
  name: string;
  age: number;
  gender: string;
  berth_preference: string;
  seat_number: string;
  status: string;
};

export type TrainBookingConfirmation = {
  id: number;
  booking_reference: string;
  pnr_number: string;
  train_number: string;
  train_name: string;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  journey_date: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  travel_class: string;
  quota: string;
  passengers: TrainPassenger[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  base_fare: number;
  convenience_fee: number;
  gst: number;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export type PnrStatus = {
  pnr_number: string;
  train_number: string;
  train_name: string;
  from_station: string;
  to_station: string;
  journey_date: string;
  travel_class: string;
  chart_prepared: boolean;
  status: string;
  passengers: {
    name: string;
    age: number;
    gender: string;
    seat_number: string;
    status: string;
  }[];
};

export type LiveTrainStatus = {
  train_number: string;
  train_name: string;
  current_station: string;
  status_message: string;
  delay_minutes: number;
  last_updated: string;
  next_station: string;
  estimated_arrival: string;
};

export async function getStations(q: string = ""): Promise<StationInfo[]> {
  const url = `${getApiBaseUrl()}/api/trains/stations?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function searchTrains(
  fromStation: string,
  toStation: string,
  date: string
): Promise<TrainScheduleItem[]> {
  const url = `${getApiBaseUrl()}/api/trains/search?from_station=${encodeURIComponent(
    fromStation
  )}&to_station=${encodeURIComponent(toStation)}&date=${encodeURIComponent(date)}`;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to search trains");
  }
  return res.json();
}

export async function createTrainBooking(
  payload: TrainBookingPayload
): Promise<TrainBookingConfirmation> {
  const res = await fetch(`${getApiBaseUrl()}/api/trains/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to book train ticket");
  }
  return res.json();
}

export async function getPnrStatus(pnr: string): Promise<PnrStatus> {
  const res = await fetch(`${getApiBaseUrl()}/api/trains/pnr/${encodeURIComponent(pnr)}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "PNR status not found");
  }
  return res.json();
}

export async function getLiveTrainStatus(trainNumber: string): Promise<LiveTrainStatus> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/trains/live/${encodeURIComponent(trainNumber)}`,
    { cache: "no-store", credentials: "include" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Train running status not found");
  }
  return res.json();
}

export async function getTrainBookingByReference(
  reference: string
): Promise<TrainBookingConfirmation | null> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/trains/bookings/reference/${encodeURIComponent(reference)}`,
    { cache: "no-store", credentials: "include" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Could not load train booking");
  return res.json();
}

export async function getMyTrainBookings(): Promise<TrainBookingConfirmation[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/trains/my-bookings`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}
