/* ==========================================================================
   WirelessCodeCanada.ca — Global JS (vanilla, no build step)
   - Language toggle (exact-page mapping EN <-> FR)
   - Mobile nav
   - Issue-selector deep links
   - Complaint-letter wizard + jsPDF export
   No data is ever stored or transmitted. Everything runs client-side.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- EN <-> FR exact-page map (filenames only) ---- */
  var EN_TO_FR = {
    "index.html": "index.html",
    "complaint-letter-generator.html": "generateur-lettre-plainte.html",
    "wireless-code-rights.html": "droits-code-sans-fil.html",
    "ccts-complaint-guide.html": "guide-plainte-ccts.html",
    "bill-shock-guide.html": "guide-factures-surprises.html",
    "switch-provider-guide.html": "guide-changer-fournisseur.html",
    "internet-code-rights.html": "droits-code-internet.html",
    "faq.html": "faq.html",
    "shop.html": "boutique.html",
    "privacy-policy.html": "politique-confidentialite.html",
    "terms-of-use.html": "conditions-utilisation.html",
    "disclaimer.html": "avis-juridique.html",
    "about.html": "a-propos.html"
  };
  var FR_TO_EN = {};
  Object.keys(EN_TO_FR).forEach(function (k) { FR_TO_EN[EN_TO_FR[k]] = k; });

  function currentLang() {
    return location.pathname.indexOf("/fr/") !== -1 ? "fr" : "en";
  }
  function currentFile() {
    var parts = location.pathname.split("/");
    var f = parts[parts.length - 1];
    return f && f.indexOf(".html") !== -1 ? f : "index.html";
  }
  /* Returns the equivalent page path in the other language. */
  function counterpartHref() {
    var lang = currentLang();
    var file = currentFile();
    if (lang === "en") {
      return "../fr/" + (EN_TO_FR[file] || "index.html");
    }
    return "../en/" + (FR_TO_EN[file] || "index.html");
  }

  /* ---- Wire up the language toggle ---- */
  function initLangToggle() {
    var toggle = document.querySelector(".lang-toggle");
    if (!toggle) return;
    var other = counterpartHref();
    var lang = currentLang();
    toggle.querySelectorAll("a").forEach(function (a) {
      var target = (a.getAttribute("data-lang") || "").toLowerCase();
      if (target === lang) {
        a.classList.add("active");
        a.setAttribute("aria-current", "true");
        a.setAttribute("href", "#");
        a.addEventListener("click", function (e) { e.preventDefault(); });
      } else {
        a.classList.remove("active");
        a.setAttribute("href", other);
      }
    });
  }

  /* ---- Mobile nav ---- */
  function initNav() {
    var btn = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- Footer year ---- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* =========================================================================
     ISSUE DEFINITIONS — drive both the dropdown and the generated letter.
     Each issue maps to: a label, the legal hook (citation), and the demand.
     `key` values are also used as ?issue= deep-link slugs from the homepage.
     ========================================================================= */
  var ISSUES = {
    "switching-fee": {
      en: {
        label: "Unexpected switching or cancellation fee (post Oct 2025)",
        cite: "Section 2 of the Telecommunications Act as amended (in force October 30, 2025), which prohibits carriers from charging fees to cancel service or switch providers.",
        demand: "a full refund of the switching/cancellation fee charged to my account, plus written confirmation that no such fee will be applied."
      },
      fr: {
        label: "Frais de changement ou de résiliation inattendus (après oct. 2025)",
        cite: "l'article 2 de la Loi sur les télécommunications modifiée (en vigueur le 30 octobre 2025), qui interdit aux fournisseurs de facturer des frais pour résilier un service ou changer de fournisseur.",
        demand: "un remboursement complet des frais de changement/résiliation facturés à mon compte, ainsi qu'une confirmation écrite qu'aucuns tels frais ne seront appliqués."
      }
    },
    "bill-higher": {
      en: {
        label: "Bill higher than agreed plan price",
        cite: "Sections C and D of the CRTC Wireless Code, which require carriers to provide a clear Critical Information Summary and prohibit charges that exceed the agreed price without express consent.",
        demand: "that my bill be corrected to reflect the agreed plan price and that any overcharged amounts be credited to my account."
      },
      fr: {
        label: "Facture supérieure au prix du forfait convenu",
        cite: "les sections C et D du Code sur les services sans fil du CRTC, qui exigent un résumé des renseignements essentiels clair et interdisent les frais dépassant le prix convenu sans consentement exprès.",
        demand: "que ma facture soit corrigée pour refléter le prix convenu et que tout montant facturé en trop soit crédité à mon compte."
      }
    },
    "data-overage": {
      en: {
        label: "Data overage charge on an unlimited plan",
        cite: "Section F of the CRTC Wireless Code, which caps data overage charges at $50/month and requires the carrier to suspend charges until the customer expressly consents to continue.",
        demand: "the removal of all data overage charges and a credit for any amount charged beyond the $50 monthly cap."
      },
      fr: {
        label: "Frais d'excédent de données sur un forfait illimité",
        cite: "la section F du Code sur les services sans fil du CRTC, qui plafonne les frais d'excédent de données à 50 $/mois et exige la suspension des frais jusqu'au consentement exprès du client.",
        demand: "le retrait de tous les frais d'excédent de données et un crédit pour tout montant facturé au-delà du plafond mensuel de 50 $."
      }
    },
    "roaming": {
      en: {
        label: "International roaming charge not authorized",
        cite: "Section F of the CRTC Wireless Code, which caps international data roaming charges at $100/month and requires express consent before exceeding the cap.",
        demand: "a credit for all unauthorized roaming charges in excess of the $100 monthly cap."
      },
      fr: {
        label: "Frais d'itinérance internationale non autorisés",
        cite: "la section F du Code sur les services sans fil du CRTC, qui plafonne les frais d'itinérance de données internationale à 100 $/mois et exige un consentement exprès avant de dépasser ce plafond.",
        demand: "un crédit pour tous les frais d'itinérance non autorisés dépassant le plafond mensuel de 100 $."
      }
    },
    "locked-phone": {
      en: {
        label: "Phone not unlocked despite request",
        cite: "Section G of the CRTC Wireless Code, which requires all devices to be provided unlocked, or unlocked free of charge on request.",
        demand: "that my device be unlocked free of charge immediately and written confirmation of the unlock."
      },
      fr: {
        label: "Téléphone non déverrouillé malgré ma demande",
        cite: "la section G du Code sur les services sans fil du CRTC, qui exige que tous les appareils soient fournis déverrouillés, ou déverrouillés gratuitement sur demande.",
        demand: "que mon appareil soit déverrouillé gratuitement immédiatement, avec confirmation écrite du déverrouillage."
      }
    },
    "contract-change": {
      en: {
        label: "Contract terms changed without consent",
        cite: "Section D of the CRTC Wireless Code, which prohibits carriers from changing the key terms or the price of a fixed-term contract without the customer's express consent.",
        demand: "that my original contract terms and price be restored, and any resulting overcharges credited to my account."
      },
      fr: {
        label: "Modalités du contrat modifiées sans consentement",
        cite: "la section D du Code sur les services sans fil du CRTC, qui interdit de modifier les modalités clés ou le prix d'un contrat à durée déterminée sans le consentement exprès du client.",
        demand: "que les modalités et le prix d'origine de mon contrat soient rétablis et que tout montant facturé en trop soit crédité."
      }
    },
    "refused-resolve": {
      en: {
        label: "Provider refused to resolve complaint",
        cite: "the CRTC Wireless Code and the mandate of the Commission for Complaints for Telecom-television Services (CCTS), which obligates carriers to address customer complaints in good faith.",
        demand: "a substantive written response resolving my complaint within 14 days, failing which I will escalate to the CCTS."
      },
      fr: {
        label: "Le fournisseur a refusé de régler ma plainte",
        cite: "le Code sur les services sans fil du CRTC et le mandat de la Commission des plaintes relatives aux services de télécom-télévision (CPRST), qui obligent les fournisseurs à traiter les plaintes de bonne foi.",
        demand: "une réponse écrite substantielle réglant ma plainte dans les 14 jours, faute de quoi je porterai l'affaire devant la CPRST."
      }
    },
    "internet": {
      en: {
        label: "Internet service issue (Internet Code)",
        cite: "the CRTC Internet Code, which governs clear pricing, bill management tools, and contract terms for home internet services.",
        demand: "that my internet billing be corrected in accordance with the Internet Code and any overcharges credited to my account."
      },
      fr: {
        label: "Problème de service Internet (Code sur les services Internet)",
        cite: "le Code sur les services Internet du CRTC, qui régit la clarté des prix, les outils de gestion de facture et les modalités des services Internet résidentiels.",
        demand: "que ma facturation Internet soit corrigée conformément au Code sur les services Internet et que tout montant en trop soit crédité."
      }
    },
    "other": {
      en: {
        label: "Other",
        cite: "the CRTC Wireless Code and the customer-protection rules enforced by the CRTC and the CCTS.",
        demand: "that this matter be investigated and resolved in accordance with my rights under the Wireless Code."
      },
      fr: {
        label: "Autre",
        cite: "le Code sur les services sans fil du CRTC et les règles de protection des consommateurs appliquées par le CRTC et la CPRST.",
        demand: "que cette affaire soit examinée et réglée conformément à mes droits en vertu du Code sur les services sans fil."
      }
    }
  };

  /* =========================================================================
     COMPLAINT WIZARD
     ========================================================================= */
  function initWizard() {
    var form = document.getElementById("complaint-wizard");
    if (!form) return;

    var lang = currentLang();
    var steps = Array.prototype.slice.call(form.querySelectorAll(".wizard-step"));
    var segs = Array.prototype.slice.call(document.querySelectorAll(".wizard-progress .seg"));
    var stepLabel = document.querySelector(".wizard-step-label");
    var current = 0;
    var TOTAL = steps.length; // 4: three input steps + result

    var T = lang === "fr" ? {
      step: "Étape", of: "sur", result: "Résultat", required: "Ce champ est obligatoire.",
      back: "Retour", next: "Suivant", generate: "Générer ma lettre",
      dateRange: "La date doit se situer au cours des deux dernières années.",
      amount: "Veuillez saisir un montant valide."
    } : {
      step: "Step", of: "of", result: "Result", required: "This field is required.",
      back: "Back", next: "Next", generate: "Generate my letter",
      dateRange: "The date must be within the last two years.",
      amount: "Please enter a valid amount."
    };

    function showStep(i) {
      steps.forEach(function (s, idx) { s.classList.toggle("active", idx === i); });
      segs.forEach(function (seg, idx) {
        seg.classList.toggle("done", idx < i);
        seg.classList.toggle("current", idx === i);
      });
      if (stepLabel) {
        stepLabel.textContent = (i === TOTAL - 1)
          ? T.step + " " + (i + 1) + " — " + T.result
          : T.step + " " + (i + 1) + " " + T.of + " " + TOTAL;
      }
      current = i;
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      var foc = steps[i].querySelector("input, select, textarea, button");
      if (foc) { try { foc.focus({ preventScroll: true }); } catch (e) {} }
    }

    function setError(field, msg) {
      field.classList.add("invalid");
      var err = field.parentElement.querySelector(".form-error");
      if (err) { err.textContent = msg; err.classList.add("show"); }
    }
    function clearError(field) {
      field.classList.remove("invalid");
      var err = field.parentElement.querySelector(".form-error");
      if (err) err.classList.remove("show");
    }

    function validateStep(i) {
      var ok = true;
      steps[i].querySelectorAll("[required]").forEach(function (field) {
        clearError(field);
        if (!field.value.trim()) { setError(field, T.required); ok = false; return; }
        if (field.type === "date") {
          var d = new Date(field.value);
          var twoYrAgo = new Date(); twoYrAgo.setFullYear(twoYrAgo.getFullYear() - 2);
          var now = new Date();
          if (isNaN(d) || d < twoYrAgo || d > now) { setError(field, T.dateRange); ok = false; }
        }
        if (field.dataset.kind === "amount") {
          var v = parseFloat(field.value);
          if (isNaN(v) || v < 0) { setError(field, T.amount); ok = false; }
        }
      });
      return ok;
    }

    form.querySelectorAll("[data-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!validateStep(current)) return;
        if (current === TOTAL - 2) buildLetter();
        showStep(Math.min(current + 1, TOTAL - 1));
      });
    });
    form.querySelectorAll("[data-back]").forEach(function (btn) {
      btn.addEventListener("click", function () { showStep(Math.max(current - 1, 0)); });
    });
    form.querySelectorAll("input, select, textarea").forEach(function (f) {
      f.addEventListener("input", function () { clearError(f); });
    });

    /* ---- Pre-fill issue type from ?issue= deep link ---- */
    var params = new URLSearchParams(location.search);
    var preIssue = params.get("issue");
    var issueSelect = form.querySelector('[name="issueType"]');
    if (preIssue && issueSelect && ISSUES[preIssue]) {
      issueSelect.value = preIssue;
    }

    /* ---- Build the letter text from inputs ---- */
    function val(name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el ? el.value.trim() : "";
    }

    function formatDate(iso) {
      if (!iso) return "";
      var d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA",
        { year: "numeric", month: "long", day: "numeric" });
    }

    var lastLetter = "";

    function buildLetter() {
      var name = val("fullName");
      var city = val("city");
      var prov = val("province");
      var email = val("email");
      var phone = val("phone");
      var provider = val("providerName");
      var issueKey = val("issueType") || "other";
      var issue = (ISSUES[issueKey] || ISSUES.other)[lang];
      var incidentDate = formatDate(val("incidentDate"));
      var amount = val("amount");
      var details = val("details");
      var refNum = val("refNumber");
      var today = new Date().toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA",
        { year: "numeric", month: "long", day: "numeric" });

      var senderBlock = [name, city ? city + (prov ? ", " + prov : "") : prov, email, phone]
        .filter(Boolean).join("\n");

      var amountStr = amount
        ? (lang === "fr"
            ? parseFloat(amount).toFixed(2).replace(".", ",") + " $ CAD"
            : "$" + parseFloat(amount).toFixed(2) + " CAD")
        : "";

      var letter;
      if (lang === "fr") {
        letter =
senderBlock + "\n\n" +
today + "\n\n" +
"Service à la clientèle — " + (provider || "[Fournisseur]") + "\n" +
"Objet : Plainte officielle — " + issue.label + (refNum ? " (Réf. : " + refNum + ")" : "") + "\n\n" +
"Madame, Monsieur,\n\n" +
"Je vous écris pour déposer une plainte officielle concernant mon service avec " + (provider || "[Fournisseur]") + ". " +
"Le " + (incidentDate || "[date]") + ", le problème suivant est survenu" + (amountStr ? ", impliquant un montant contesté de " + amountStr : "") + " :\n\n" +
(details ? details + "\n\n" : "[Décrivez ce qui s'est passé.]\n\n") +
"Cette situation contrevient à " + issue.cite + "\n\n" +
"En conséquence, je demande " + issue.demand + "\n\n" +
"Je vous prie de répondre par écrit dans un délai de 14 jours civils. À défaut d'une résolution satisfaisante, je porterai cette plainte devant la Commission des plaintes relatives aux services de télécom-télévision (CPRST), l'organisme indépendant mandaté par le CRTC, à l'adresse www.ccts-cprst.ca ou au 1-888-221-1687.\n\n" +
"Veuillez agréer mes salutations distinguées.\n\n\n" +
(name || "[Votre nom]");
      } else {
        letter =
senderBlock + "\n\n" +
today + "\n\n" +
"Customer Service — " + (provider || "[Provider]") + "\n" +
"Re: Formal complaint — " + issue.label + (refNum ? " (Ref: " + refNum + ")" : "") + "\n\n" +
"To whom it may concern,\n\n" +
"I am writing to file a formal complaint regarding my service with " + (provider || "[Provider]") + ". " +
"On " + (incidentDate || "[date]") + ", the following issue occurred" + (amountStr ? ", involving a disputed amount of " + amountStr : "") + ":\n\n" +
(details ? details + "\n\n" : "[Describe what happened.]\n\n") +
"This is contrary to " + issue.cite + "\n\n" +
"Accordingly, I am requesting " + issue.demand + "\n\n" +
"Please respond in writing within 14 calendar days. If this matter is not resolved to my satisfaction, I will escalate this complaint to the Commission for Complaints for Telecom-television Services (CCTS) — the independent body mandated by the CRTC — at www.ccts-cprst.ca or 1-888-221-1687.\n\n" +
"Sincerely,\n\n\n" +
(name || "[Your name]");
      }

      lastLetter = letter;
      var preview = document.getElementById("letter-output");
      if (preview) preview.textContent = letter;
    }

    /* ---- Actions on the result step ---- */
    var dlBtn = document.getElementById("download-pdf");
    if (dlBtn) {
      dlBtn.addEventListener("click", function () {
        if (!lastLetter) return;
        if (!window.jspdf || !window.jspdf.jsPDF) {
          alert(lang === "fr"
            ? "Le générateur PDF n'a pas pu se charger. Vous pouvez copier ou imprimer la lettre."
            : "The PDF generator could not load. You can copy or print the letter instead.");
          return;
        }
        var doc = new window.jspdf.jsPDF({ unit: "pt", format: "letter" });
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        var margin = 64;
        var maxw = doc.internal.pageSize.getWidth() - margin * 2;
        var lines = doc.splitTextToSize(lastLetter, maxw);
        var y = margin, lh = 16, ph = doc.internal.pageSize.getHeight() - margin;
        lines.forEach(function (ln) {
          if (y > ph) { doc.addPage(); y = margin; }
          doc.text(ln, margin, y); y += lh;
        });
        doc.save((lang === "fr" ? "plainte-" : "complaint-") + (val("providerName") || "letter").toLowerCase().replace(/\s+/g, "-") + ".pdf");
      });
    }
    var copyBtn = document.getElementById("copy-letter");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (!lastLetter) return;
        navigator.clipboard.writeText(lastLetter).then(function () {
          var t = copyBtn.textContent;
          copyBtn.textContent = lang === "fr" ? "Copié ✓" : "Copied ✓";
          setTimeout(function () { copyBtn.textContent = t; }, 1800);
        });
      });
    }
    var printBtn = document.getElementById("print-letter");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
    var restartBtn = document.getElementById("restart-wizard");
    if (restartBtn) restartBtn.addEventListener("click", function () { form.reset(); showStep(0); });

    showStep(0);
  }

  /* ---- Boot ---- */
  document.addEventListener("DOMContentLoaded", function () {
    initLangToggle();
    initNav();
    initYear();
    initWizard();
  });
})();
