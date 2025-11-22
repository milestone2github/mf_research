// backend/controllers/InsuranceForm.js
const express = require("express");

const router = express.Router();
const { connectToMilestoneDB } = require("../dbConfig/connection"); // adjust path

let collection;
async function getCollection() {
  if (!collection) {
    const conn = connectToMilestoneDB();
    // wait until connected if needed
    if (conn.readyState !== 1) {
      await new Promise((resolve, reject) => {
        conn.once("connected", resolve);
        conn.once("error", reject);
      });
    }
    collection = conn.db.collection("policies_data_aria");
  }
  return collection;
}

// ---- Build final JSON like your structure ----
function buildPolicyJSON(f) {
  return {
    policy_id: f.policy_id,

    insurer: {
      code: f.insurer_code,
      name: f.insurer_name,
    },

    product: {
      name: f.product_name,
      marketing_name: f.product_marketing_name,
      policy_type: f.product_policy_type,
      sub_type: f.product_sub_type,
      version_no: f.version_no,
      effective_from: f.effective_from,
      effective_to: f.effective_to || null,
      status: f.status || "active",
    },

    regulatory: {
      irda_urn: f.irda_urn || "",
      approval_date: f.approval_date || "",
      last_filed_revision_date: f.last_filed_revision_date || "",
      is_open_for_new_sales: !!f.is_open_for_new_sales,
      is_open_for_renewal: !!f.is_open_for_renewal,
    },

    target_positioning: {
      segments: f.segments || [],
      sell_tags: f.sell_tags || [],
      red_flag_tags: f.red_flag_tags || [],
    },

    eligibility: {
      min_entry_age_years: f.min_entry_age_years ?? null,
      max_entry_age_years: f.max_entry_age_years ?? null,
      min_renewal_age_years: f.min_renewal_age_years ?? null,
      max_renewal_age_years: f.max_renewal_age_years ?? null,
      lifelong_renewal: !!f.lifelong_renewal,
      min_members_in_floater: f.min_members_in_floater ?? null,
      max_members_in_floater: f.max_members_in_floater ?? null,
      allowed_relations: f.allowed_relations || [],
      smoker_allowed: !!f.smoker_allowed,
      max_bmi_without_loading: f.max_bmi_without_loading ?? null,
      max_bmi_with_loading: f.max_bmi_with_loading ?? null,
      occupational_exclusions_summary: f.occupational_exclusions_summary || "",
      geographical_restrictions: f.geographical_restrictions || "",
    },

    premium_structure: {
      rating_basis: f.rating_basis || "",
      gender_specific: !!f.gender_specific,
      zone_pricing: !!f.zone_pricing,
      zones: f.zones || [],
      gst_rate_pct: f.gst_rate_pct ?? null,
      premium_frequency_allowed: f.premium_frequency_allowed || [],
      premium_type: f.premium_type || "",
      premium_payment_term_years: f.premium_payment_term_years || [],
      policy_term_years: f.policy_term_years || [],
      premium_table_source: {
        file_id: f.premium_table_file_id || "",
        notes: f.premium_table_notes || "",
      },
    },

    documents: {
      policy_wording_url: f.policy_wording_url || "",
      brochure_url: f.brochure_url || "",
      key_feature_document_url: f.key_feature_document_url || "",
      proposal_form_url: f.proposal_form_url || "",
      faq_url: f.faq_url || "",
      internal_notes_doc_id: f.internal_notes_doc_id || "",
    },

    servicing: {
      tpa_type: f.tpa_type || "inhouse",
      tpa_names: f.tpa_names || [],
      hospital_network_size: {
        india_total: f.hospital_network_india_total ?? null,
        statewise: {
          Delhi: f.hospital_network_delhi ?? null,
          Haryana: f.hospital_network_haryana ?? null,
        },
      },
      cashless_turnaround_time_hours: f.cashless_turnaround_time_hours ?? null,
      reimbursement_average_days: f.reimbursement_average_days ?? null,
      customer_care_numbers: f.customer_care_numbers || [],
      whatsapp_support_available: !!f.whatsapp_support_available,
      app_based_claims: !!f.app_based_claims,
    },

    claim_statistics: {
      overall_claim_settlement_ratio_pct:
        f.overall_claim_settlement_ratio_pct ?? null,
      health_claim_settlement_ratio_pct:
        f.health_claim_settlement_ratio_pct ?? null,
      average_claim_size: f.average_claim_size ?? null,
      avg_claim_processing_days: f.avg_claim_processing_days ?? null,
      source: f.claim_stats_source || "",
    },

    health_indemnity: {
      is_applicable: f.product_policy_type === "health_indemnity",
      coverage: {
        sum_insured_options_lakhs: f.sum_insured_options_lakhs || [],
        base_si_type: f.base_si_type || "per_year",
      },
      cost_sharing: f.cost_sharing || {},
      bonuses_and_discounts: f.bonuses_and_discounts || {},
      waiting_periods: f.waiting_periods || {},
      ped_and_uw: f.ped_and_uw || {},
      special_features: f.special_features || {},
      exclusions: f.exclusions || {},
    },

    term: {
      is_applicable: f.product_policy_type === "term",
      coverage: f.term_coverage || {},
      payout_options: f.term_payout_options || {},
      underwriting: f.term_underwriting || {},
      riders_default_available: f.term_riders_default_available || [],
      claim_rules: f.term_claim_rules || {},
    },

    term_ulip: {
      is_applicable: f.product_policy_type === "term_ulip",
      life_cover: f.ulip_life_cover || {},
      investment_side: f.ulip_investment_side || {},
      charges: f.ulip_charges || {},
    },

    riders: f.riders || [],

    aria_metadata: {
      last_reviewed_by: f.last_reviewed_by || "",
      last_reviewed_on: f.last_reviewed_on || "",
      data_quality_score: f.data_quality_score ?? null,
      missing_critical_fields: f.missing_critical_fields || [],
      explain_priority_flags: f.explain_priority_flags || [],
    },
  };
}

// ---- POST /api/insurance-form ----
router.post("/", async (req, res) => {
  try {
    const formPayload = req.body;

    if (!formPayload.policy_id) {
      return res.status(400).json({ error: "policy_id required" });
    }

    const finalDoc = buildPolicyJSON(formPayload);

    const col = await getCollection();
    const result = await col.insertOne({
      ...finalDoc,
      _ingestedAt: new Date(),
      _source: "insurance_form",
    });

    res.status(201).json({ insertedId: result.insertedId });
  } catch (e) {
    console.error("[insurance-form] save error:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
