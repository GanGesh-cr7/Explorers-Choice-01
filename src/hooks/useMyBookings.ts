"use client";

import { useEffect, useState } from "react";
import { fetchMyBookings, type BookingSummary } from "@/lib/account";

export function useMyBookings() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchMyBookings()
      .then((items) => {
        if (!cancelled) setBookings(items);
      })
      .catch(() => {
        if (!cancelled) setError("We could not load your bookings right now. Please try again shortly.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { bookings, loading, error };
}