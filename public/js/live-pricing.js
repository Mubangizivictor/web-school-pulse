// Overwrites the static pricing cards rendered from src/config/site.ts with
// live data from getPublicSubscriptionPlans once it loads, mirroring the
// same fetch-then-patch pattern register.astro uses for its plan step. The
// static cards stay as the fallback shown until this resolves (or if it
// fails), so pricing is never blank.
(function () {
  var functionsBaseUrl = 'https://europe-west1-school-pulse-3d95b.cloudfunctions.net';

  function money(amount) {
    return 'UGX ' + Number(amount || 0).toLocaleString('en-UG');
  }

  function cycleLabel(cycle) {
    if (cycle === 'monthly') return 'per month';
    if (cycle === 'yearly') return 'per year';
    return 'per term';
  }

  async function loadLivePricing() {
    var cardsRoot = document.querySelector('[data-pricing-cards]');
    if (!cardsRoot) return;
    try {
      var response = await fetch(functionsBaseUrl + '/getPublicSubscriptionPlans');
      if (!response.ok) throw new Error('plans unavailable');
      var body = await response.json();
      if (!Array.isArray(body.plans) || !body.plans.length) return;

      body.plans.forEach(function (plan) {
        var card = cardsRoot.querySelector('[data-plan-card="' + plan.name + '"]');
        if (!card) return;
        var isCustom = plan.customPricing || Number(plan.price || 0) <= 0;

        var priceEl = card.querySelector('[data-plan-price]');
        if (priceEl) priceEl.textContent = isCustom ? 'Custom pricing' : money(plan.price);

        var cycleEl = card.querySelector('[data-plan-cycle]');
        if (cycleEl) cycleEl.textContent = isCustom ? 'Talk to us' : cycleLabel(plan.billingCycle);

        var rangeEl = card.querySelector('[data-plan-range]');
        if (rangeEl) {
          rangeEl.textContent = Number(plan.maxStudents || 0) > 0
            ? 'Up to ' + Number(plan.maxStudents).toLocaleString('en-US') + ' students'
            : (isCustom ? 'For large or custom institutions' : 'Flexible school capacity');
        }

        var badgeEl = card.querySelector('[data-plan-badge]');
        if (badgeEl) badgeEl.style.display = plan.isPopular ? '' : 'none';

        var featuresEl = card.querySelector('[data-plan-features]');
        if (featuresEl && Array.isArray(plan.includedFeatures) && plan.includedFeatures.length) {
          featuresEl.innerHTML = plan.includedFeatures
            .map(function (feature) {
              return '<div class="feature-item"><span class="check">✓</span><span></span></div>';
            })
            .join('');
          featuresEl.querySelectorAll('.feature-item span:last-child').forEach(function (el, i) {
            el.textContent = plan.includedFeatures[i];
          });
        }

        var ctaEl = card.querySelector('[data-plan-cta]');
        if (ctaEl) {
          if (isCustom) {
            ctaEl.textContent = 'Contact Us';
            ctaEl.href = '/contact';
          } else {
            ctaEl.textContent = 'Choose Plan';
          }
        }
      });
    } catch (error) {
      console.warn('Live pricing unavailable, showing static fallback plans.', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLivePricing);
  } else {
    loadLivePricing();
  }
})();
