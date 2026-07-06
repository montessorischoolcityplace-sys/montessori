"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase-client";
import BackButton from "@/components/navegation/back-button";
import PublicHeader from "@/components/layout/header";

type PreferredContactMethod =
  | "phone"
  | "email"
  | "whatsapp"
  | "app_notification";

export default function ParentProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [preferredContactMethod, setPreferredContactMethod] =
    useState<PreferredContactMethod>("app_notification");

  const [street, setStreet] = useState("");
  const [exteriorNumber, setExteriorNumber] = useState("");
  const [interiorNumber, setInteriorNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("TX");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [references, setReferences] = useState("");

  const [occupation, setOccupation] = useState("");
  const [workplace, setWorkplace] = useState("");


  useEffect(() => {
    async function loadProfile() {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          router.push("/login?redirectTo=/dashboard/profile");
          return;
        }

        setUid(currentUser.uid);
        setEmail(currentUser.email ?? "");

        const displayName = currentUser.displayName ?? "";
        const [name, ...rest] = displayName.split(" ");

        setFirstName(name);
        setLastName(rest.join(" "));
        setPhotoUrl(currentUser.photoURL ?? "");

        const res = await fetch(`/api/parents?uid=${currentUser.uid}`);
        const data = await res.json().catch(() => null);

        if (res.status === 404) {
          setIsEdit(false);
          return;
        }

        if (!res.ok) {
          throw new Error(data?.error ?? "Could not load parent profile");
        }

        setIsEdit(true);

        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setPhotoUrl(data.photoUrl ?? "");
        setEmail(data.email ?? currentUser.email ?? "");

        setPhone(data.contact?.phone ?? "");
        setAlternatePhone(data.contact?.alternatePhone ?? "");
        setWhatsapp(data.contact?.whatsapp ?? "");

        setPreferredContactMethod(
          data.preferredContactMethod ?? "app_notification"
        );

        setStreet(data.address?.street ?? "");
        setExteriorNumber(data.address?.exteriorNumber ?? "");
        setInteriorNumber(data.address?.interiorNumber ?? "");
        setNeighborhood(data.address?.neighborhood ?? "");
        setCity(data.address?.city ?? "");
        setState(data.address?.state ?? "TX");
        setZipCode(data.address?.zipCode ?? "");
        setCountry(data.address?.country ?? "United States");
        setReferences(data.address?.references ?? "");

        setOccupation(data.occupation ?? "");
        setWorkplace(data.workplace ?? "");

      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!uid) {
      setError("No authenticated user found.");
      return;
    }

    setSaving(true);

    const payload = {
    uid,
    userId: uid,

    email,
    firstName,
    lastName,
    photoUrl: photoUrl || undefined,

    contact: {
        phone,
        alternatePhone: alternatePhone || undefined,
        whatsapp: whatsapp || undefined,
    },

    address: {
        street,
        exteriorNumber: exteriorNumber || undefined,
        interiorNumber: interiorNumber || undefined,
        neighborhood: neighborhood || undefined,
        city,
        state,
        zipCode,
        country,
        references: references || undefined,
    },

    preferredContactMethod,

    emergencyContacts: [],
    authorizedPickupPeople: [],

    occupation: occupation || undefined,
    workplace: workplace || undefined,

    profileCompleted: true,
    status: "active",
    };

    try {
      const res = await fetch(
        isEdit
          ? `/api/parents?uid=${uid}&action=completeProfile`
          : "/api/parents",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not save profile");
      }

      setSuccess("Profile saved successfully.");
      setIsEdit(true);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="pp-loading">Loading profile...</div>;
  }

  return (
    <>
      <PublicHeader />
      <style>{`
        .pp-root {
          min-height: calc(100vh - 4rem);
          background: linear-gradient(135deg, #fffaf0, #f7efe2);
          padding: 42px 20px 90px;
          font-family: Outfit, sans-serif;
        }

        .pp-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .pp-header {
          margin-bottom: 26px;
        }

        .pp-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: #c0410c;
          margin-bottom: 8px;
        }

        .pp-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 42px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .pp-subtitle {
          color: #725944;
          line-height: 1.6;
        }

        .pp-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .pp-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 24px;
          color: #1a0f00;
          margin-bottom: 18px;
        }

        .pp-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .pp-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        @media(max-width: 720px) {
          .pp-grid-2,
          .pp-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        .pp-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .pp-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #5a3a20;
        }

        .pp-input,
.pp-select {
  border: 1.5px solid #d7c4aa;
  border-radius: 13px;
  padding: 12px 14px;
  background: #fffdf8;
  font-size: 15px;
  outline: none;
  color: #5a3a20;
}

        .pp-input:focus,
        .pp-select:focus {
          border-color: #c0410c;
          box-shadow: 0 0 0 3px rgba(192,65,12,.12);
        }

        .pp-banner {
          border-radius: 14px;
          padding: 13px 16px;
          margin-bottom: 18px;
          font-size: 14px;
        }

        .pp-error {
          background: #fff0eb;
          color: #aa2e0b;
          border: 1px solid #f1a38d;
        }

        .pp-success {
          background: #edf8ef;
          color: #287a3e;
          border: 1px solid #99d3a5;
        }

        .pp-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .pp-btn {
          border: none;
          border-radius: 15px;
          padding: 13px 24px;
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          font-weight: 700;
          cursor: pointer;
        }

        .pp-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .pp-loading {
          padding: 80px 20px;
          text-align: center;
          color: #725944;
          font-family: Outfit, sans-serif;
        }
      `}</style>

      <main className="pp-root">
        <div className="pp-container">
          <BackButton label="Back"/>
          <header className="pp-header">
            <div className="pp-eyebrow">
              {isEdit ? "Parent profile" : "Complete profile"}
            </div>
            <h1 className="pp-title">
              {isEdit ? "Edit your information" : "Complete your parent profile"}
            </h1>
            <p className="pp-subtitle">
              Please complete your personal, contact, and address information
              before registering students or accessing payments.
            </p>
          </header>

          {error && <div className="pp-banner pp-error">⚠ {error}</div>}
          {success && <div className="pp-banner pp-success">✓ {success}</div>}

          <form onSubmit={handleSubmit}>
            <section className="pp-card">
              <h2 className="pp-card-title">Personal information</h2>

              <div className="pp-grid-2">
                <div className="pp-field">
                  <label className="pp-label">First name *</label>
                  <input
                    className="pp-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">Last name *</label>
                  <input
                    className="pp-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pp-field">
                <label className="pp-label">Email</label>
                <input className="pp-input" value={email} disabled />
              </div>

              
            </section>

            <section className="pp-card">
              <h2 className="pp-card-title">Contact information</h2>

              <div className="pp-grid-3">
                <div className="pp-field">
                  <label className="pp-label">Phone *</label>
                  <input
                    className="pp-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">Alternate phone</label>
                  <input
                    className="pp-input"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">WhatsApp</label>
                  <input
                    className="pp-input"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>

              <div className="pp-field">
                <label className="pp-label">Preferred contact method</label>
                <select
                  className="pp-select"
                  value={preferredContactMethod}
                  onChange={(e) =>
                    setPreferredContactMethod(
                      e.target.value as PreferredContactMethod
                    )
                  }
                >
                  <option value="app_notification">App notification</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </section>

            <section className="pp-card">
              <h2 className="pp-card-title">Address</h2>

              <div className="pp-field">
                <label className="pp-label">Street *</label>
                <input
                  className="pp-input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>

              <div className="pp-grid-3">
                <div className="pp-field">
                  <label className="pp-label">Exterior number</label>
                  <input
                    className="pp-input"
                    value={exteriorNumber}
                    onChange={(e) => setExteriorNumber(e.target.value)}
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">Interior number</label>
                  <input
                    className="pp-input"
                    value={interiorNumber}
                    onChange={(e) => setInteriorNumber(e.target.value)}
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">Neighborhood</label>
                  <input
                    className="pp-input"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  />
                </div>
              </div>

              <div className="pp-grid-3">
                <div className="pp-field">
                  <label className="pp-label">City *</label>
                  <input
                    className="pp-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">State *</label>
                  <input
                    className="pp-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">ZIP code *</label>
                  <input
                    className="pp-input"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pp-field">
                <label className="pp-label">Country *</label>
                <input
                  className="pp-input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>

              <div className="pp-field">
                <label className="pp-label">Address references</label>
                <input
                  className="pp-input"
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                />
              </div>
            </section>

            <section className="pp-card">
              <h2 className="pp-card-title">Additional information</h2>

              <div className="pp-grid-2">
                <div className="pp-field">
                  <label className="pp-label">Occupation</label>
                  <input
                    className="pp-input"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">Workplace</label>
                  <input
                    className="pp-input"
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <div className="pp-actions">
              <button className="pp-btn" disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}