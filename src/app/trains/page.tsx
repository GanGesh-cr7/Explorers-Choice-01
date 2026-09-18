"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers";
import {
  getStations,
  searchTrains,
  createTrainBooking,
  getPnrStatus,
  getLiveTrainStatus,
  StationInfo,
  TrainScheduleItem,
  TrainClassAvailability,
  PassengerInput,
  TrainBookingConfirmation,
  PnrStatus,
  LiveTrainStatus,
} from "@/lib/trainsApi";

export default function TrainsPage() {
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"search" | "pnr" | "live">("search");

  // Stations
  const [stations, setStations] = useState<StationInfo[]>([]);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromStation, setFromStation] = useState<StationInfo>({
    code: "NDLS",
    name: "New Delhi",
    city: "New Delhi",
    state: "Delhi",
  });
  const [toStation, setToStation] = useState<StationInfo>({
    code: "BSB",
    name: "Varanasi Junction",
    city: "Varanasi",
    state: "Uttar Pradesh",
  });
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Form Fields
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];
  const [journeyDate, setJourneyDate] = useState(defaultDateStr);
  const [travelClass, setTravelClass] = useState("ALL");
  const [quota, setQuota] = useState("GENERAL");

  // Search Results
  const [trains, setTrains] = useState<TrainScheduleItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Booking Modal State
  const [bookingTrain, setBookingTrain] = useState<TrainScheduleItem | null>(null);
  const [selectedClass, setSelectedClass] = useState<TrainClassAvailability | null>(null);
  const [passengers, setPassengers] = useState<PassengerInput[]>([
    { name: user?.full_name || "", age: 28, gender: "M", berth_preference: "No Preference" },
  ]);
  const [contactName, setContactName] = useState(user?.full_name || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "+91 ");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<TrainBookingConfirmation | null>(null);

  // PNR State
  const [pnrInput, setPnrInput] = useState("");
  const [pnrResult, setPnrResult] = useState<PnrStatus | null>(null);
  const [isCheckingPnr, setIsCheckingPnr] = useState(false);
  const [pnrError, setPnrError] = useState("");

  // Live Status State
  const [liveTrainInput, setLiveTrainInput] = useState("");
  const [liveResult, setLiveResult] = useState<LiveTrainStatus | null>(null);
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [liveError, setLiveError] = useState("");

  // Fetch initial stations
  useEffect(() => {
    getStations("").then((res) => setStations(res));
  }, []);

  // Station search handlers
  const handleSearchFrom = (q: string) => {
    setFromQuery(q);
    setShowFromDropdown(true);
    getStations(q).then((res) => setStations(res));
  };

  const handleSearchTo = (q: string) => {
    setToQuery(q);
    setShowToDropdown(true);
    getStations(q).then((res) => setStations(res));
  };

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Perform Train Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fromStation || !toStation) {
      setSearchError("Please select both source and destination stations.");
      return;
    }
    setIsSearching(true);
    setSearchError("");
    setHasSearched(true);
    try {
      const results = await searchTrains(fromStation.code, toStation.code, journeyDate);
      setTrains(results);
    } catch (err: any) {
      setSearchError(err.message || "Could not retrieve train schedules. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Quick route search
  const triggerQuickRoute = (fromCode: string, fromName: string, toCode: string, toName: string) => {
    setFromStation({ code: fromCode, name: fromName, city: fromName, state: "" });
    setToStation({ code: toCode, name: toName, city: toName, state: "" });
    setActiveTab("search");
    setIsSearching(true);
    setHasSearched(true);
    searchTrains(fromCode, toCode, journeyDate)
      .then((res) => setTrains(res))
      .catch((err) => setSearchError(err.message))
      .finally(() => setIsSearching(false));
  };

  // Passenger management in booking modal
  const addPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers([
      ...passengers,
      { name: "", age: 25, gender: "M", berth_preference: "No Preference" },
    ]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const updatePassenger = (index: number, field: keyof PassengerInput, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  // Open booking drawer
  const startBooking = (train: TrainScheduleItem, cls: TrainClassAvailability) => {
    setBookingTrain(train);
    setSelectedClass(cls);
    setBookingError("");
    setConfirmedBooking(null);
    if (user) {
      setContactName(user.full_name || "");
      setContactEmail(user.email || "");
      setContactPhone(user.phone || "+91 ");
    }
  };

  // Submit Booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTrain || !selectedClass) return;

    for (const p of passengers) {
      if (!p.name.trim()) {
        setBookingError("Please enter full name for all passengers.");
        return;
      }
      if (!p.age || p.age < 1 || p.age > 120) {
        setBookingError("Please enter a valid age for all passengers.");
        return;
      }
    }

    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setBookingError("Please enter lead passenger contact details (Name, Email, Mobile).");
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError("");

    try {
      const payload = {
        train_number: bookingTrain.train_number,
        train_name: bookingTrain.train_name,
        from_station_code: bookingTrain.from_station_code,
        from_station_name: bookingTrain.from_station_name,
        to_station_code: bookingTrain.to_station_code,
        to_station_name: bookingTrain.to_station_name,
        journey_date: journeyDate,
        departure_time: bookingTrain.departure_time,
        arrival_time: bookingTrain.arrival_time,
        duration: bookingTrain.duration,
        travel_class: selectedClass.travel_class,
        quota: quota,
        passengers: passengers,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      };

      const result = await createTrainBooking(payload);
      setConfirmedBooking(result);
    } catch (err: any) {
      setBookingError(err.message || "Failed to complete ticket booking. Please try again.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // PNR lookup
  const handleCheckPnr = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pnrInput.trim().replace(/-/g, "").replace(/\s/g, "");
    if (!clean || clean.length !== 10) {
      setPnrError("Please enter a valid 10-digit PNR number.");
      return;
    }
    setIsCheckingPnr(true);
    setPnrError("");
    setPnrResult(null);
    try {
      const res = await getPnrStatus(clean);
      setPnrResult(res);
    } catch (err: any) {
      setPnrError(err.message || "Could not retrieve PNR status.");
    } finally {
      setIsCheckingPnr(false);
    }
  };

  // Live Train lookup
  const handleCheckLive = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = liveTrainInput.trim();
    if (!clean) {
      setLiveError("Please enter a train number.");
      return;
    }
    setIsCheckingLive(true);
    setLiveError("");
    setLiveResult(null);
    try {
      const res = await getLiveTrainStatus(clean);
      setLiveResult(res);
    } catch (err: any) {
      setLiveError(err.message || "Could not retrieve train running status.");
    } finally {
      setIsCheckingLive(false);
    }
  };

  // Price calculations for modal
  const baseSingleFare = selectedClass?.fare || 0;
  const totalBase = baseSingleFare * passengers.length;
  const convFee = 20 * passengers.length;
  const isAcClass = ["1A", "2A", "3A", "3E", "CC", "EC"].includes(selectedClass?.travel_class || "");
  const gstAmount = isAcClass ? Math.round(totalBase * 0.05) : 0;
  const grandTotal = totalBase + convFee + gstAmount;

  return (
    <div className="min-h-screen bg-sand/30 pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-forest py-16 text-ivory sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,122,86,0.18),transparent_60%)]" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ivory">
              🚆 Indian Railways &bull; IRCTC Authorised Partner
            </span>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ivory sm:text-5xl lg:text-6xl">
              Book Train Tickets &amp; Discover India by Rail
            </h1>
            <p className="mt-4 text-lg text-ivory/80">
              Instant reservation on Vande Bharat, Rajdhani, Shatabdi and Superfast express trains.
              Live seat availability, PNR tracking, and automatic email confirmations.
            </p>
          </div>

          {/* Search Box / Tool Hub Card */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 sm:p-6 lg:p-8">
            {/* Tabs */}
            <div className="flex border-b border-sand pb-4">
              <button
                type="button"
                onClick={() => setActiveTab("search")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 font-display text-sm font-semibold transition-colors sm:text-base ${
                  activeTab === "search"
                    ? "border-forest text-forest"
                    : "border-transparent text-charcoal-soft hover:text-forest"
                }`}
              >
                <span>🚆</span> Book Tickets
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pnr")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 font-display text-sm font-semibold transition-colors sm:text-base ${
                  activeTab === "pnr"
                    ? "border-forest text-forest"
                    : "border-transparent text-charcoal-soft hover:text-forest"
                }`}
              >
                <span>📋</span> Check PNR Status
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("live")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 font-display text-sm font-semibold transition-colors sm:text-base ${
                  activeTab === "live"
                    ? "border-forest text-forest"
                    : "border-transparent text-charcoal-soft hover:text-forest"
                }`}
              >
                <span>📍</span> Live Train Status
              </button>
            </div>

            {/* TAB 1: Search Form */}
            {activeTab === "search" && (
              <form onSubmit={handleSearch} className="mt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                  {/* From Station */}
                  <div className="relative md:col-span-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
                      From Station
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={fromQuery || (fromStation ? `${fromStation.name} (${fromStation.code})` : "")}
                        onChange={(e) => handleSearchFrom(e.target.value)}
                        onFocus={() => setShowFromDropdown(true)}
                        placeholder="Enter City or Station Code"
                        className="w-full rounded-lg border border-sand bg-ivory/40 px-3 py-3 font-semibold text-forest placeholder:text-charcoal-soft/50 focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                    {showFromDropdown && (
                      <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-sand bg-white p-1 shadow-lg">
                        {stations.map((s) => (
                          <button
                            key={s.code}
                            type="button"
                            onClick={() => {
                              setFromStation(s);
                              setFromQuery("");
                              setShowFromDropdown(false);
                            }}
                            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-sand/30"
                          >
                            <span className="font-semibold text-forest">{s.name}</span>
                            <span className="rounded bg-sand/60 px-1.5 py-0.5 text-xs font-mono font-bold text-forest">
                              {s.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center md:col-span-1">
                    <button
                      type="button"
                      onClick={swapStations}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-sand/20 text-forest transition-transform hover:rotate-180 hover:bg-sand/50"
                      title="Swap stations"
                    >
                      ⇄
                    </button>
                  </div>

                  {/* To Station */}
                  <div className="relative md:col-span-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
                      To Station
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={toQuery || (toStation ? `${toStation.name} (${toStation.code})` : "")}
                        onChange={(e) => handleSearchTo(e.target.value)}
                        onFocus={() => setShowToDropdown(true)}
                        placeholder="Enter City or Station Code"
                        className="w-full rounded-lg border border-sand bg-ivory/40 px-3 py-3 font-semibold text-forest placeholder:text-charcoal-soft/50 focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                    {showToDropdown && (
                      <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-sand bg-white p-1 shadow-lg">
                        {stations.map((s) => (
                          <button
                            key={s.code}
                            type="button"
                            onClick={() => {
                              setToStation(s);
                              setToQuery("");
                              setShowToDropdown(false);
                            }}
                            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-sand/30"
                          >
                            <span className="font-semibold text-forest">{s.name}</span>
                            <span className="rounded bg-sand/60 px-1.5 py-0.5 text-xs font-mono font-bold text-forest">
                              {s.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
                      Journey Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-sand bg-ivory/40 px-3 py-3 font-semibold text-forest focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>

                {/* Second Row: Filter Class & Quota */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-sand/40 pt-4">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="mr-2 text-xs font-semibold text-charcoal-soft">Class:</span>
                      <select
                        value={travelClass}
                        onChange={(e) => setTravelClass(e.target.value)}
                        className="rounded-md border border-sand bg-ivory/30 px-2.5 py-1.5 text-xs font-semibold text-forest focus:outline-none"
                      >
                        <option value="ALL">All Classes</option>
                        <option value="CC">AC Chair Car (CC)</option>
                        <option value="EC">Exec Chair Car (EC)</option>
                        <option value="3A">AC 3 Tier (3A)</option>
                        <option value="2A">AC 2 Tier (2A)</option>
                        <option value="1A">AC 1st Class (1A)</option>
                        <option value="SL">Sleeper (SL)</option>
                      </select>
                    </div>

                    <div>
                      <span className="mr-2 text-xs font-semibold text-charcoal-soft">Quota:</span>
                      <select
                        value={quota}
                        onChange={(e) => setQuota(e.target.value)}
                        className="rounded-md border border-sand bg-ivory/30 px-2.5 py-1.5 text-xs font-semibold text-forest focus:outline-none"
                      >
                        <option value="GENERAL">General Quota (GN)</option>
                        <option value="TATKAL">Tatkal Quota (TQ)</option>
                        <option value="LADIES">Ladies Quota (LD)</option>
                        <option value="SENIOR_CITIZEN">Senior Citizen (SS)</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSearching} variant="primary" size="md">
                    {isSearching ? "Searching Trains..." : "Search Trains"}
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 2: PNR Status Form */}
            {activeTab === "pnr" && (
              <form onSubmit={handleCheckPnr} className="mt-6 max-w-xl">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
                  Enter 10-Digit PNR Number
                </label>
                <div className="mt-2 flex gap-3">
                  <input
                    type="text"
                    maxLength={10}
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value)}
                    placeholder="e.g. 4003541222"
                    className="flex-1 rounded-lg border border-sand bg-ivory/40 px-4 py-3 font-mono text-base font-bold text-forest placeholder:text-charcoal-soft/50 focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                  <Button type="submit" disabled={isCheckingPnr} variant="primary">
                    {isCheckingPnr ? "Checking..." : "Get Status"}
                  </Button>
                </div>
                {pnrError && <p className="mt-2 text-sm text-terracotta">{pnrError}</p>}

                {/* PNR Result Display */}
                {pnrResult && (
                  <div className="mt-6 rounded-xl border border-forest/20 bg-ivory/40 p-5">
                    <div className="flex items-center justify-between border-b border-sand pb-3">
                      <div>
                        <span className="text-xs font-bold uppercase text-charcoal-soft">PNR Status</span>
                        <h3 className="font-mono text-xl font-extrabold text-forest">{pnrResult.pnr_number}</h3>
                      </div>
                      <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest">
                        {pnrResult.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-charcoal-soft">Train:</span>
                        <p className="font-semibold text-forest">{pnrResult.train_name} ({pnrResult.train_number})</p>
                      </div>
                      <div>
                        <span className="text-xs text-charcoal-soft">Journey Date:</span>
                        <p className="font-semibold text-forest">{pnrResult.journey_date}</p>
                      </div>
                      <div>
                        <span className="text-xs text-charcoal-soft">From:</span>
                        <p className="font-semibold text-forest">{pnrResult.from_station}</p>
                      </div>
                      <div>
                        <span className="text-xs text-charcoal-soft">To:</span>
                        <p className="font-semibold text-forest">{pnrResult.to_station}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-sand pt-3">
                      <span className="text-xs font-bold uppercase text-charcoal-soft">Passenger Berths</span>
                      <div className="mt-2 space-y-2">
                        {pnrResult.passengers.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded bg-white p-2 text-sm">
                            <span className="font-medium text-forest">{p.name || `Passenger ${idx + 1}`}</span>
                            <span className="font-bold text-forest">{p.seat_number}</span>
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* TAB 3: Live Train Status */}
            {activeTab === "live" && (
              <form onSubmit={handleCheckLive} className="mt-6 max-w-xl">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
                  Enter 5-Digit Train Number
                </label>
                <div className="mt-2 flex gap-3">
                  <input
                    type="text"
                    maxLength={5}
                    value={liveTrainInput}
                    onChange={(e) => setLiveTrainInput(e.target.value)}
                    placeholder="e.g. 22436 (Vande Bharat)"
                    className="flex-1 rounded-lg border border-sand bg-ivory/40 px-4 py-3 font-mono text-base font-bold text-forest placeholder:text-charcoal-soft/50 focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                  <Button type="submit" disabled={isCheckingLive} variant="primary">
                    {isCheckingLive ? "Locating..." : "Locate Train"}
                  </Button>
                </div>
                {liveError && <p className="mt-2 text-sm text-terracotta">{liveError}</p>}

                {/* Live Result Display */}
                {liveResult && (
                  <div className="mt-6 rounded-xl border border-forest/20 bg-ivory/40 p-5">
                    <div className="flex items-center justify-between border-b border-sand pb-3">
                      <div>
                        <span className="text-xs font-bold uppercase text-charcoal-soft">Train Running Status</span>
                        <h3 className="text-lg font-bold text-forest">{liveResult.train_name} ({liveResult.train_number})</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        liveResult.delay_minutes === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {liveResult.status_message}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded bg-white p-3">
                        <span className="text-xs text-charcoal-soft">Current / Last Passed Station</span>
                        <p className="mt-1 font-bold text-forest">{liveResult.current_station}</p>
                      </div>
                      <div className="rounded bg-white p-3">
                        <span className="text-xs text-charcoal-soft">Next Upcoming Station</span>
                        <p className="mt-1 font-bold text-forest">{liveResult.next_station}</p>
                        <span className="text-xs text-terracotta">Est: {liveResult.estimated_arrival}</span>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container className="mt-10">
        {searchError && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
            {searchError}
          </div>
        )}

        {/* Search Results List */}
        {hasSearched && (
          <div className="mb-14">
            <div className="flex items-center justify-between pb-4">
              <h2 className="font-display text-2xl font-bold text-forest">
                Available Trains ({trains.length})
              </h2>
              <span className="text-sm font-semibold text-charcoal-soft">
                {fromStation?.name} ({fromStation?.code}) &rarr; {toStation?.name} ({toStation?.code}) on {journeyDate}
              </span>
            </div>

            {trains.length === 0 && !isSearching && (
              <div className="rounded-xl border border-sand bg-white p-10 text-center">
                <p className="text-base text-charcoal-soft">
                  No direct trains found for this route and date. Try selecting another date or alternative major junction.
                </p>
              </div>
            )}

            <div className="space-y-5">
              {trains.map((train) => (
                <div
                  key={train.train_number}
                  className="rounded-xl border border-sand bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-sand/40 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-forest/10 px-2 py-0.5 font-mono text-xs font-bold text-forest">
                          {train.train_number}
                        </span>
                        <h3 className="text-lg font-bold text-forest sm:text-xl">
                          {train.train_name}
                        </h3>
                        <span className="rounded-full bg-sand/60 px-2.5 py-0.5 text-xs font-semibold text-charcoal">
                          {train.train_type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-charcoal-soft">
                        Runs on: {train.running_days.join(", ")} {train.has_pantry && " &bull; 🍱 Food Available"}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <span className="text-lg font-extrabold text-forest">{train.departure_time}</span>
                        <p className="text-xs text-charcoal-soft">{train.from_station_name} ({train.from_station_code})</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-charcoal-soft">{train.duration}</span>
                        <div className="h-0.5 w-16 bg-sand" />
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-forest">{train.arrival_time}</span>
                        <p className="text-xs text-charcoal-soft">{train.to_station_name} ({train.to_station_code})</p>
                      </div>
                    </div>
                  </div>

                  {/* Classes & Fares Carousel/Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {train.classes
                      .filter((c) => travelClass === "ALL" || c.travel_class === travelClass)
                      .map((cls) => (
                        <div
                          key={cls.travel_class}
                          className="flex flex-col justify-between rounded-lg border border-sand bg-ivory/20 p-3 transition-colors hover:border-forest/40 hover:bg-ivory/50"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-forest">{cls.travel_class}</span>
                              <span className="text-xs font-bold text-forest">₹{cls.fare}</span>
                            </div>
                            <span className={`mt-2 block text-xs font-bold ${
                              cls.status_type === "AVAILABLE" ? "text-emerald-700" : "text-amber-700"
                            }`}>
                              {cls.status}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => startBooking(train, cls)}
                            className="mt-3 w-full rounded bg-forest py-1.5 text-center text-xs font-bold text-ivory transition-colors hover:bg-forest/90"
                          >
                            Book
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Scenic & Vande Bharat Rail Routes */}
        <section className="mb-14">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
              Recommended Railway Journeys
            </span>
            <h2 className="font-display text-2xl font-bold text-forest sm:text-3xl">
              Popular Express &amp; Vande Bharat Routes
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "New Delhi → Varanasi",
                train: "Vande Bharat Express",
                fromCode: "NDLS",
                fromName: "New Delhi",
                toCode: "BSB",
                toName: "Varanasi",
                time: "8h 00m",
                fare: "From ₹1,750",
              },
              {
                title: "Mumbai CSMT → Madgaon (Goa)",
                train: "Konkan Vande Bharat",
                fromCode: "CSMT",
                fromName: "Mumbai",
                toCode: "MAO",
                toName: "Madgaon",
                time: "7h 45m",
                fare: "From ₹1,815",
              },
              {
                title: "New Delhi → Katra (Vaishno Devi)",
                train: "Vande Bharat Express",
                fromCode: "NDLS",
                fromName: "New Delhi",
                toCode: "SVDK",
                toName: "Katra",
                time: "8h 00m",
                fare: "From ₹1,630",
              },
              {
                title: "Bengaluru → Chennai Central",
                train: "Mysuru-Chennai Vande Bharat",
                fromCode: "SBC",
                fromName: "Bengaluru",
                toCode: "MAS",
                toName: "Chennai",
                time: "4h 30m",
                fare: "From ₹995",
              },
              {
                title: "Howrah (Kolkata) → New Delhi",
                train: "Howrah Rajdhani Express",
                fromCode: "HWH",
                fromName: "Kolkata",
                toCode: "NDLS",
                toName: "New Delhi",
                time: "17h 15m",
                fare: "From ₹2,420",
              },
              {
                title: "New Delhi → Jaipur",
                train: "Ajmer Shatabdi Express",
                fromCode: "NDLS",
                fromName: "New Delhi",
                toCode: "JAI",
                toName: "Jaipur",
                time: "4h 30m",
                fare: "From ₹1,040",
              },
            ].map((route, i) => (
              <div
                key={i}
                className="group flex flex-col justify-between rounded-xl border border-sand bg-white p-5 shadow-sm transition-all hover:border-forest/30 hover:shadow-md"
              >
                <div>
                  <span className="text-xs font-bold text-terracotta">{route.train}</span>
                  <h3 className="mt-1 font-display text-lg font-bold text-forest">{route.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-charcoal-soft">
                    <span>⏱ {route.time}</span>
                    <span className="font-bold text-forest">{route.fare}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => triggerQuickRoute(route.fromCode, route.fromName, route.toCode, route.toName)}
                  className="mt-4 w-full rounded-lg border border-sand bg-ivory/50 py-2 text-xs font-bold text-forest transition-colors hover:bg-forest hover:text-ivory"
                >
                  Check Schedules &rarr;
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Explorers Choice Rail Perks */}
        <section className="rounded-2xl bg-forest p-8 text-ivory sm:p-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="text-3xl">🛡️</div>
              <h3 className="mt-3 font-display text-lg font-bold">Instant PNR &amp; Confirmation</h3>
              <p className="mt-1 text-sm text-ivory/80">
                Official IRCTC-backed booking reference and instant automated email e-tickets delivered to your inbox.
              </p>
            </div>
            <div>
              <div className="text-3xl">⚡</div>
              <h3 className="mt-3 font-display text-lg font-bold">Live Train Tracking</h3>
              <p className="mt-1 text-sm text-ivory/80">
                Real-time GPS tracking and live running delay updates for over 10,000+ Indian Railway trains.
              </p>
            </div>
            <div>
              <div className="text-3xl">💬</div>
              <h3 className="mt-3 font-display text-lg font-bold">24x7 Rail Support</h3>
              <p className="mt-1 text-sm text-ivory/80">
                Dedicated travel desk support at infoexplorerschoice@gmail.com for modifications, tatkal, and tour integrations.
              </p>
            </div>
          </div>
        </section>
      </Container>

      {/* BOOKING MODAL / DRAWER */}
      {bookingTrain && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sand pb-4">
              <div>
                <span className="rounded bg-forest/10 px-2 py-0.5 font-mono text-xs font-bold text-forest">
                  {bookingTrain.train_number}
                </span>
                <h2 className="text-xl font-bold text-forest">{bookingTrain.train_name}</h2>
                <p className="text-xs text-charcoal-soft">
                  {bookingTrain.from_station_name} &rarr; {bookingTrain.to_station_name} &bull; Class: <strong>{selectedClass.travel_class}</strong> &bull; Date: <strong>{journeyDate}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingTrain(null)}
                className="rounded-full p-2 text-charcoal-soft hover:bg-sand/30 hover:text-forest"
              >
                ✕
              </button>
            </div>

            {/* If Confirmed View */}
            {confirmedBooking ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-800">
                  ✓
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-forest">
                  Train Ticket Confirmed!
                </h3>
                <p className="mt-1 text-sm text-charcoal-soft">
                  A copy of your e-ticket has been sent to <strong>{confirmedBooking.contact_email}</strong> and <strong>infoexplorerschoice@gmail.com</strong>.
                </p>

                <div className="mt-6 rounded-xl border border-sand bg-ivory/40 p-5 text-left text-sm">
                  <div className="flex justify-between border-b border-sand pb-3">
                    <div>
                      <span className="text-xs text-charcoal-soft">PNR Number</span>
                      <p className="font-mono text-xl font-extrabold text-forest">{confirmedBooking.pnr_number}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-charcoal-soft">Booking Ref</span>
                      <p className="font-mono font-bold text-forest">{confirmedBooking.booking_reference}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-bold uppercase text-charcoal-soft">Allocated Seats &amp; Berths</span>
                    <div className="mt-2 space-y-1.5">
                      {confirmedBooking.passengers.map((p, idx) => (
                        <div key={idx} className="flex justify-between rounded bg-white p-2 text-xs">
                          <span className="font-semibold text-forest">{p.name} ({p.age} yrs, {p.gender})</span>
                          <span className="font-bold text-forest">{p.seat_number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-sand pt-3 font-bold text-forest">
                    <span>Total Paid</span>
                    <span className="text-lg text-terracotta">₹{confirmedBooking.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <Link
                    href="/trains"
                    onClick={() => {
                      setBookingTrain(null);
                      setConfirmedBooking(null);
                    }}
                    className="rounded-lg bg-forest px-6 py-2.5 text-sm font-bold text-ivory hover:bg-forest/90"
                  >
                    Done
                  </Link>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleConfirmBooking} className="mt-4 space-y-5">
                {bookingError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 font-semibold">
                    {bookingError}
                  </div>
                )}

                {/* Passenger Form */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-forest">
                      Passenger Details ({passengers.length})
                    </h3>
                    {passengers.length < 6 && (
                      <button
                        type="button"
                        onClick={addPassenger}
                        className="text-xs font-bold text-terracotta hover:underline"
                      >
                        + Add Passenger
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-3">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="rounded-lg border border-sand bg-ivory/20 p-3.5">
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-xs font-bold text-forest">Passenger #{idx + 1}</span>
                          {passengers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePassenger(idx)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              required
                              placeholder="Full Name as on ID"
                              value={p.name}
                              onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                              className="w-full rounded border border-sand bg-white px-2.5 py-1.5 text-xs font-semibold text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="number"
                              required
                              min={1}
                              max={120}
                              placeholder="Age"
                              value={p.age}
                              onChange={(e) => updatePassenger(idx, "age", Number(e.target.value))}
                              className="w-full rounded border border-sand bg-white px-2.5 py-1.5 text-xs font-semibold text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <select
                              value={p.gender}
                              onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                              className="w-full rounded border border-sand bg-white px-2 py-1.5 text-xs font-semibold text-forest focus:outline-none"
                            >
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                              <option value="O">Other</option>
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <select
                              value={p.berth_preference || "No Preference"}
                              onChange={(e) => updatePassenger(idx, "berth_preference", e.target.value)}
                              className="w-full rounded border border-sand bg-white px-2 py-1.5 text-xs font-semibold text-forest focus:outline-none"
                            >
                              <option value="No Preference">No Preference</option>
                              <option value="Lower">Lower Berth</option>
                              <option value="Middle">Middle Berth</option>
                              <option value="Upper">Upper Berth</option>
                              <option value="Side Lower">Side Lower</option>
                              <option value="Side Upper">Side Upper</option>
                              <option value="Window">Window Seat</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-forest">
                    Contact Information (For SMS &amp; E-Ticket)
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-soft">Lead Passenger Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="mt-1 w-full rounded border border-sand bg-white px-2.5 py-2 text-xs font-semibold text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-soft">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="mt-1 w-full rounded border border-sand bg-white px-2.5 py-2 text-xs font-semibold text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-soft">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="mt-1 w-full rounded border border-sand bg-white px-2.5 py-2 text-xs font-semibold text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="rounded-xl border border-sand bg-sand/20 p-4 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-charcoal-soft">Ticket Base Fare ({passengers.length} × ₹{baseSingleFare})</span>
                    <span className="font-semibold text-forest">₹{totalBase.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-charcoal-soft">IRCTC Convenience Fee</span>
                    <span className="font-semibold text-forest">₹{convFee}</span>
                  </div>
                  {gstAmount > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-charcoal-soft">GST (5% on AC Classes)</span>
                      <span className="font-semibold text-forest">₹{gstAmount}</span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between border-t border-sand pt-2 font-bold">
                    <span className="text-sm text-forest">Grand Total</span>
                    <span className="text-base text-terracotta">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBookingTrain(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingBooking}
                  >
                    {isSubmittingBooking ? "Booking Ticket..." : `Confirm & Book Ticket (₹${grandTotal.toLocaleString()})`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
