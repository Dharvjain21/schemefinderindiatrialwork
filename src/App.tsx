import { useEffect, useMemo, useState } from "react";
import {
  STATES,
  EDUCATION_LEVELS,
  OCCUPATIONS,
  SCHEME_TYPES,
  allSchemes,
  type Scheme,
} from "./schemes";

const initialForm = {
  age: "",
  gender: "",
  caste: "",
  income: "",
  education: "",
  occupation: "",
  state: "All India",
  type: "",
  search: "",
  showEligibleOnly: true,
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMatchScore(scheme: Scheme, form: typeof initialForm) {
  let score = 0;
  let eligible = true;

  const age = form.age ? Number(form.age) : null;
  const income = form.income ? Number(form.income) : null;

  if (scheme.eligibility.age && age !== null) {
    if (age < scheme.eligibility.age.min || age > scheme.eligibility.age.max) {
      eligible = false;
    } else {
      score += 15;
    }
  }

  if (scheme.eligibility.gender && form.gender) {
    if (!scheme.eligibility.gender.includes(form.gender)) {
      eligible = false;
    } else {
      score += 12;
    }
  }

  if (scheme.eligibility.caste && form.caste) {
    if (!scheme.eligibility.caste.includes(form.caste)) {
      eligible = false;
    } else {
      score += 12;
    }
  }

  if (scheme.eligibility.incomeMax && income !== null) {
    if (income > scheme.eligibility.incomeMax) {
      eligible = false;
    } else {
      score += 14;
    }
  }

  if (scheme.eligibility.education && form.education) {
    if (!scheme.eligibility.education.includes(form.education)) {
      eligible = false;
    } else {
      score += 12;
    }
  }

  if (scheme.eligibility.occupation && form.occupation) {
    if (!scheme.eligibility.occupation.includes(form.occupation)) {
      eligible = false;
    } else {
      score += 10;
    }
  }

  if (scheme.eligibility.states && form.state) {
    if (
      !scheme.eligibility.states.includes("All India") &&
      !scheme.eligibility.states.includes(form.state)
    ) {
      eligible = false;
    } else {
      score += 10;
    }
  }

  if (form.type && scheme.schemeType !== form.type) {
    eligible = false;
  }

  const searchTokens = normalize(form.search).split(" ").filter(Boolean);
  if (searchTokens.length > 0) {
    const haystack = normalize(`${scheme.name} ${scheme.ministry} ${scheme.tags.join(" ")}`);
    const matches = searchTokens.filter((token) => haystack.includes(token)).length;
    score += matches * 6;
    if (matches === 0) {
      eligible = false;
    }
  }

  return { score, eligible };
}

export function App() {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const stored = localStorage.getItem("schemefinder-form");
    if (stored) {
      setForm({ ...initialForm, ...JSON.parse(stored) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("schemefinder-form", JSON.stringify(form));
  }, [form]);

  const results = useMemo(() => {
    return allSchemes
      .map((scheme) => {
        const { score, eligible } = getMatchScore(scheme, form);
        return { scheme, score, eligible };
      })
      .filter((item) => (form.showEligibleOnly ? item.eligible : true))
      .sort((a, b) => b.score - a.score);
  }, [form]);

  const totalSchemes = allSchemes.length;
  const eligibleCount = results.filter((result) => result.eligible).length;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => setForm(initialForm);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              SchemeFinder India
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Find government schemes you are eligible for
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Curated from NSP, Buddy4Study, MyGov, and official ministry portals.
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {totalSchemes}+ schemes indexed
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_1.5fr]">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Eligibility profile</h2>
            <p className="text-sm text-slate-500">
              Fill in key details to get a ranked list of matching schemes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Age
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="18"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Gender
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Caste category
              <select
                name="caste"
                value={form.caste}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Annual income (₹)
              <input
                type="number"
                name="income"
                value={form.income}
                onChange={handleChange}
                placeholder="250000"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Highest education
              <select
                name="education"
                value={form.education}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Occupation
              <select
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select</option>
                {OCCUPATIONS.map((occupation) => (
                  <option key={occupation} value={occupation}>
                    {occupation}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              State
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Scheme type
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All types</option>
                {SCHEME_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-sm font-medium text-slate-700">
            Search keywords
            <input
              type="text"
              name="search"
              value={form.search}
              onChange={handleChange}
              placeholder="e.g. agriculture, women, engineering"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="showEligibleOnly"
                checked={form.showEligibleOnly}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Show only eligible schemes
            </label>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
            >
              Reset form
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Matching schemes</h2>
                <p className="text-sm text-slate-500">
                  {eligibleCount} eligible results based on your profile.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                Database size: {totalSchemes}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {results.slice(0, 24).map(({ scheme, score, eligible }) => (
              <article
                key={scheme.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {scheme.name}
                    </h3>
                    <p className="text-sm text-slate-500">{scheme.ministry}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                    {scheme.schemeType}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase text-slate-400">Amount</p>
                    <p className="font-medium text-slate-700">
                      {formatCurrency(scheme.amount.value)}
                      <span className="text-xs text-slate-400">/{scheme.amount.frequency}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400">Deadline</p>
                    <p className="font-medium text-slate-700">
                      {scheme.deadline ?? "Rolling"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400">Match</p>
                    <p className="font-medium text-slate-700">
                      {eligible ? "Eligible" : "Check"} · {Math.min(score, 100)}%
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scheme.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p className="text-slate-500">Source: {scheme.source}</p>
                  <a
                    href={scheme.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Apply / Learn more →
                  </a>
                </div>
              </article>
            ))}
            {results.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No schemes match right now. Try removing filters or widening your
                criteria.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
