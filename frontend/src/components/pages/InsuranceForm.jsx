import React, { useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendUrl = process.env.REACT_APP_API_BASE_URL;

// converts "parent_in_law" -> "Parent In Law"
const pretty = (s) =>
  String(s)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** ---------- CONFIG (maps to your JSON) ---------- **/
const FORM_CONFIG = [
  {
    section: "Basic",
    fields: [
      { key: "policy_id", label: "Policy ID", type: "text", required: true },
    ],
  },

  {
    section: "Insurer",
    fields: [
      { key: "insurer_code", label: "Insurer Code", type: "text", required: true },
      { key: "insurer_name", label: "Insurer Name", type: "text", required: true },
    ],
  },

  {
    section: "Product",
    fields: [
      { key: "product_name", label: "Product Name", type: "text", required: true },
      { key: "product_marketing_name", label: "Marketing Name", type: "text" },

      {
        key: "product_policy_type",
        label: "Policy Type",
        type: "select",
        options: ["health_indemnity", "term", "term_ulip"],
        required: true,
      },
      {
        key: "product_sub_type",
        label: "Sub Type",
        type: "select",
        options: ["family_floater", "individual", "multi_individual"],
        required: true,
      },

      { key: "version_no", label: "Version No", type: "text" },
      { key: "effective_from", label: "Effective From", type: "date" },
      { key: "effective_to", label: "Effective To", type: "date" },

      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["active", "withdrawn", "legacy"],
        required: true,
      },
    ],
  },

  {
    section: "Regulatory",
    fields: [
      { key: "irda_urn", label: "IRDA URN", type: "text" },
      { key: "approval_date", label: "Approval Date", type: "date" },
      { key: "last_filed_revision_date", label: "Last Filed Revision Date", type: "date" },
      { key: "is_open_for_new_sales", label: "Open for New Sales", type: "boolean" },
      { key: "is_open_for_renewal", label: "Open for Renewal", type: "boolean" },
    ],
  },

  {
    section: "Target Positioning",
    fields: [
      {
        key: "segments",
        label: "Segments",
        type: "multi",
        options: ["young_family", "senior_citizen", "high_networth", "mass_affluent"],
      },
      {
        key: "sell_tags",
        label: "Sell Tags",
        type: "multi",
        options: [
          "room_rent_no_cap",
          "good_for_long_term",
          "maternity_friendly",
          "investor_who_wants_market_linked",
        ],
      },
      {
        key: "red_flag_tags",
        label: "Red Flag Tags",
        type: "multi",
        options: ["strict_room_rent_cap", "low_day_care_coverage", "high_copay_for_seniors"],
      },
    ],
  },

  {
    section: "Eligibility",
    fields: [
      { key: "min_entry_age_years", label: "Min Entry Age (years)", type: "number" },
      { key: "max_entry_age_years", label: "Max Entry Age (years)", type: "number" },
      { key: "min_renewal_age_years", label: "Min Renewal Age (years)", type: "number" },
      { key: "max_renewal_age_years", label: "Max Renewal Age (years)", type: "number" },
      { key: "lifelong_renewal", label: "Lifelong Renewal", type: "boolean" },
      { key: "min_members_in_floater", label: "Min Members in Floater", type: "number" },
      { key: "max_members_in_floater", label: "Max Members in Floater", type: "number" },
      {
        key: "allowed_relations",
        label: "Allowed Relations",
        type: "multi",
        options: ["self","spouse","children","parents","parent_in_law","siblings"],
      },
      { key: "smoker_allowed", label: "Smoker Allowed", type: "boolean" },
      { key: "max_bmi_without_loading", label: "Max BMI w/o Loading", type: "number" },
      { key: "max_bmi_with_loading", label: "Max BMI with Loading", type: "number" },
      { key: "occupational_exclusions_summary", label: "Occupational Exclusions", type: "text" },
      { key: "geographical_restrictions", label: "Geographical Restrictions", type: "text" },
    ],
  },

  {
    section: "Premium Structure",
    fields: [
      {
        key: "rating_basis",
        label: "Rating Basis",
        type: "select",
        options: ["age_band", "age_last_birthday", "age_nearest_birthday"],
      },
      { key: "gender_specific", label: "Gender Specific Pricing", type: "boolean" },
      { key: "zone_pricing", label: "Zone Pricing", type: "boolean" },
      {
        key: "zones",
        label: "Zones",
        type: "multi",
        options: ["Zone 1", "Zone 2", "Zone 3"],
      },
      { key: "gst_rate_pct", label: "GST Rate (%)", type: "number" },
      {
        key: "premium_frequency_allowed",
        label: "Premium Frequency Allowed",
        type: "multi",
        options: ["annual","semi_annual","quarterly","monthly"],
      },
      {
        key: "premium_type",
        label: "Premium Type",
        type: "select",
        options: ["stepped", "level", "limited_pay"],
      },
      {
        key: "premium_payment_term_years",
        label: "Premium Payment Terms (years)",
        type: "multiNumber",
      },
      {
        key: "policy_term_years",
        label: "Policy Terms (years)",
        type: "multiNumber",
      },
      { key: "premium_table_file_id", label: "Premium Table File ID", type: "text" },
      { key: "premium_table_notes", label: "Premium Table Notes", type: "text" },
    ],
  },

  {
    section: "Documents",
    fields: [
      { key: "policy_wording_url", label: "Policy Wording URL", type: "text" },
      { key: "brochure_url", label: "Brochure URL", type: "text" },
      { key: "key_feature_document_url", label: "Key Feature Doc URL", type: "text" },
      { key: "proposal_form_url", label: "Proposal Form URL", type: "text" },
      { key: "faq_url", label: "FAQ URL", type: "text" },
      { key: "internal_notes_doc_id", label: "Internal Notes Doc ID", type: "text" },
    ],
  },

  {
    section: "Servicing",
    fields: [
      {
        key: "tpa_type",
        label: "TPA Type",
        type: "select",
        options: ["inhouse","external","hybrid"],
      },
      { key: "cashless_turnaround_time_hours", label: "Cashless TAT (hours)", type: "number" },
      { key: "reimbursement_average_days", label: "Reimbursement Avg Days", type: "number" },
      { key: "whatsapp_support_available", label: "WhatsApp Support", type: "boolean" },
      { key: "app_based_claims", label: "App Based Claims", type: "boolean" },
      { key: "hospital_network_india_total", label: "Hospital Network Total (India)", type: "number" },
      { key: "hospital_network_delhi", label: "Hospital Network Delhi", type: "number" },
      { key: "hospital_network_haryana", label: "Hospital Network Haryana", type: "number" },
      {
        key: "customer_care_numbers",
        label: "Customer Care Numbers",
        type: "multiNumberText",
      }
    ],
  },

  {
    section: "Claim Statistics",
    fields: [
      { key: "overall_claim_settlement_ratio_pct", label: "Overall Claim Settlement (%)", type: "number" },
      { key: "health_claim_settlement_ratio_pct", label: "Health Claim Settlement (%)", type: "number" },
      { key: "average_claim_size", label: "Average Claim Size", type: "number" },
      { key: "avg_claim_processing_days", label: "Avg Claim Processing Days", type: "number" },
      { key: "claim_stats_source", label: "Stats Source", type: "text" },
    ],
  },

  {
    section: "Health Indemnity (Core)",
    fields: [
      { key: "hi_is_applicable", label: "Health Indemnity Applicable", type: "boolean" },
      { key: "sum_insured_options_lakhs", label: "Sum Insured Options (Lakhs)", type: "multiNumber" },
      {
        key: "base_si_type",
        label: "Base SI Type",
        type: "select",
        options: ["per_year","per_event"],
      },
      { key: "room_rent_type", label: "Room Rent Type", type: "select", options: ["no_cap","percentage","fixed_amount","category_based"] },
      { key: "icu_limit_multiple_of_room", label: "ICU Limit Multiple", type: "number" },
      { key: "pre_hosp_days", label: "Pre Hospitalization Days", type: "number" },
      { key: "post_hosp_days", label: "Post Hospitalization Days", type: "number" },
      { key: "domiciliary_limit_pct", label: "Domiciliary Limit % of SI", type: "number" },
      { key: "air_ambulance_limit_per_year", label: "Air Ambulance Limit / Year", type: "number" },
    ],
  },

  {
    section: "Riders (Simple)",
    fields: [
      { key: "critical_illness_rider_enabled", label: "Critical Illness Rider Enabled", type: "boolean" },
      { key: "critical_illness_rider_sa_min", label: "CI Rider SA Min", type: "number" },
      { key: "critical_illness_rider_sa_max", label: "CI Rider SA Max", type: "number" },
      { key: "critical_illness_waiting_period_days", label: "CI Waiting Period (days)", type: "number" },
    ],
  },
];

/** ---------- UI COMPONENT ---------- **/
export default function InsuranceForm() {
  // build default/empty form once from config
  const initialForm = useMemo(() => {
    const obj = {};
    FORM_CONFIG.forEach(sec => {
      sec.fields.forEach(f => {
        if (f.type === "select") obj[f.key] = f.options?.[0] ?? "";
        else if (f.type === "boolean") obj[f.key] = false;
        else if (f.type === "multi") obj[f.key] = [];
        else if (f.type === "multiNumber") obj[f.key] = [];
        else if (f.type === "multiNumberText") obj[f.key] = [];
        else obj[f.key] = "";
      });
    });
    return obj;
  }, []);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const update = (key, val) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const toggleMulti = (key, val) =>
    setForm(prev => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
      };
    });

  const addMultiNumber = (key, val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return;
    const arr = form[key] || [];
    update(key, Array.from(new Set([...arr, n])).sort((a,b)=>a-b));
  };

  const removeMultiItem = (key, val) => {
    const arr = form[key] || [];
    update(key, arr.filter(x => x !== val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${backendUrl}/api/insurance-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");

      toast.success("Saved successfully ✅");
      setForm(initialForm); // ✅ RESET FULL FORM
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* toaster container */}
      <ToastContainer position="top-right" autoClose={2500} />

      <h1 className="text-2xl font-bold mb-4">Policy Master Form</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {FORM_CONFIG.map((sec) => (
          <section key={sec.section} className="bg-white p-4 rounded-lg shadow border">
            <h2 className="font-semibold text-lg mb-3">{sec.section}</h2>

            <div className="grid grid-cols-2 gap-4">
              {sec.fields.map((f) => {
                const value = form[f.key];

                // TEXT / NUMBER / DATE
                if (["text","number","date"].includes(f.type)) {
                  return (
                    <div key={f.key} className="col-span-1">
                      <label className="block text-sm font-medium mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        className="border p-2 rounded w-full"
                        value={value ?? ""}
                        required={f.required}
                        onChange={(e) =>
                          update(
                            f.key,
                            f.type === "number"
                              ? (e.target.value === "" ? "" : Number(e.target.value))
                              : e.target.value
                          )
                        }
                      />
                    </div>
                  );
                }

                // BOOLEAN
                if (f.type === "boolean") {
                  return (
                    <div key={f.key} className="col-span-1 flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e)=>update(f.key, e.target.checked)}
                      />
                      <label className="text-sm font-medium">{f.label}</label>
                    </div>
                  );
                }

                // SELECT (pretty visible, raw stored)
                if (f.type === "select") {
                  return (
                    <div key={f.key} className="col-span-1">
                      <label className="block text-sm font-medium mb-1">{f.label}</label>
                      <select
                        className="border p-2 rounded w-full"
                        value={value ?? f.options[0]}
                        required={f.required}
                        onChange={(e)=>update(f.key, e.target.value)}
                      >
                        {f.options.map(op => (
                          <option key={op} value={op}>
                            {pretty(op)}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // MULTI (pretty visible, raw stored)
                if (f.type === "multi") {
                  const arr = value || [];
                  return (
                    <div key={f.key} className="col-span-2">
                      <label className="block text-sm font-medium mb-2">{f.label}</label>
                      <div className="flex flex-wrap gap-2">
                        {f.options.map(op => (
                          <button
                            type="button"
                            key={op}
                            onClick={()=>toggleMulti(f.key, op)}
                            className={`px-3 py-1 rounded-full border text-sm ${
                              arr.includes(op) ? "bg-blue-600 text-white" : "bg-white"
                            }`}
                          >
                            {pretty(op)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                // MULTI NUMBER (add/remove)
                if (f.type === "multiNumber") {
                  const arr = value || [];
                  return (
                    <div key={f.key} className="col-span-2">
                      <label className="block text-sm font-medium mb-2">{f.label}</label>

                      <MultiNumberInput onAdd={(n)=>addMultiNumber(f.key, n)} />

                      <div className="mt-2 flex flex-wrap gap-2">
                        {arr.map(n => (
                          <span key={n} className="px-3 py-1 bg-gray-100 border rounded-full text-sm">
                            {n}
                            <button
                              type="button"
                              className="ml-2 text-red-600 font-bold"
                              onClick={()=>removeMultiItem(f.key, n)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </section>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg shadow"
        >
          {saving ? "Saving..." : "Save Policy"}
        </button>
      </form>
    </div>
  );
}

/** helper for multi-number inputs */
function MultiNumberInput({ onAdd }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="number"
        className="border p-2 rounded w-40"
        value={val}
        onChange={(e)=>setVal(e.target.value)}
        placeholder="Enter number"
      />
      <button
        type="button"
        className="bg-gray-800 text-white px-3 rounded"
        onClick={()=>{
          onAdd(val);
          setVal("");
        }}
      >
        Add
      </button>
    </div>
  );
}
