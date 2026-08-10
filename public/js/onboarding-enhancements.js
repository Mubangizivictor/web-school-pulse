(() => {
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();

  ready(() => {
    const form = document.getElementById('registrationApp');
    if (!form) return;

    const functionsBaseUrl = 'https://europe-west1-school-pulse-3d95b.cloudfunctions.net';
    const $ = (id) => document.getElementById(id);

    const fieldMessage = (input, message, kind = 'error') => {
      if (!input) return;
      let node = input.closest('.form-field')?.querySelector('.field-message');
      if (!node) {
        node = document.createElement('div');
        node.className = 'field-message';
        input.closest('.form-field')?.appendChild(node);
      }
      node.className = `field-message ${kind}`;
      node.textContent = message || '';
      input.classList.toggle('field-invalid', Boolean(message) && kind === 'error');
      input.classList.toggle('field-valid', Boolean(message) && kind === 'success');
    };

    const numericOnly = (input) => {
      if (!input) return;
      input.addEventListener('input', () => {
        const clean = input.value.replace(/\D/g, '').slice(0, 9);
        if (input.value !== clean) input.value = clean;
      });
    };

    numericOnly($('schoolPhone'));
    numericOnly($('adminPhone'));

    const validateUgPhone = (input) => {
      if (!input) return false;
      const v = input.value.replace(/\D/g, '');
      const ok = /^7\d{8}$/.test(v);
      fieldMessage(input, ok ? 'Valid Uganda mobile number.' : 'Enter a valid Uganda number, for example 772123456.', ok ? 'success' : 'error');
      return ok;
    };

    ['schoolPhone', 'adminPhone'].forEach((id) => {
      const input = $(id);
      input?.addEventListener('blur', () => validateUgPhone(input));
    });

    const checkAvailability = async (kind, value, input) => {
      if (!value || !input) return;
      try {
        fieldMessage(input, 'Checking…', 'info');
        const response = await fetch(`${functionsBaseUrl}/checkRegistrationAvailability?kind=${encodeURIComponent(kind)}&value=${encodeURIComponent(value)}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'Could not check this value.');
        if (result.available) fieldMessage(input, result.message || 'Available.', 'success');
        else fieldMessage(input, result.message || 'Already in use.', 'error');
      } catch (_) {
        fieldMessage(input, 'We could not verify uniqueness right now. It will be checked again before submission.', 'info');
      }
    };

    $('schoolPhone')?.addEventListener('blur', () => {
      if (validateUgPhone($('schoolPhone'))) checkAvailability('phone', `256${$('schoolPhone').value.replace(/\D/g, '')}`, $('schoolPhone'));
    });
    $('adminPhone')?.addEventListener('blur', () => {
      if (validateUgPhone($('adminPhone'))) checkAvailability('phone', `256${$('adminPhone').value.replace(/\D/g, '')}`, $('adminPhone'));
    });
    $('schoolPrefix')?.addEventListener('blur', () => {
      const value = $('schoolPrefix').value.trim().toUpperCase();
      if (value.length >= 2) checkAvailability('prefix', value, $('schoolPrefix'));
    });

    const schoolEmail = $('schoolEmail');
    schoolEmail?.addEventListener('blur', () => {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolEmail.value.trim());
      fieldMessage(schoolEmail, ok ? 'Email format looks good.' : 'Enter a valid school email address.', ok ? 'success' : 'error');
    });

    const prefix = $('schoolPrefix');
    prefix?.addEventListener('input', () => {
      prefix.value = prefix.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    });

    const shortName = $('shortName');
    shortName?.addEventListener('input', () => {
      shortName.value = shortName.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 24);
    });

    const password = $('password');
    const confirm = $('confirmPassword');
    if (password) {
      const wrapper = document.createElement('div');
      wrapper.className = 'password-assistant';
      wrapper.innerHTML = `
        <div class="password-meter"><span></span></div>
        <div class="password-rules" aria-live="polite">
          <span data-rule="length">8+ characters</span>
          <span data-rule="upper">uppercase</span>
          <span data-rule="lower">lowercase</span>
          <span data-rule="digit">number</span>
          <span data-rule="symbol">symbol</span>
        </div>
        <button type="button" class="password-generate">Generate strong password</button>`;
      password.closest('.form-field')?.appendChild(wrapper);

      const refresh = () => {
        const v = password.value;
        const rules = {
          length: v.length >= 8,
          upper: /[A-Z]/.test(v),
          lower: /[a-z]/.test(v),
          digit: /\d/.test(v),
          symbol: /[^A-Za-z0-9]/.test(v),
        };
        const score = Object.values(rules).filter(Boolean).length;
        wrapper.querySelector('.password-meter span').style.width = `${score * 20}%`;
        Object.entries(rules).forEach(([key, ok]) => wrapper.querySelector(`[data-rule="${key}"]`)?.classList.toggle('ok', ok));
        fieldMessage(password, score === 5 ? 'Strong password.' : '', score === 5 ? 'success' : 'info');
        if (confirm?.value) fieldMessage(confirm, confirm.value === v ? 'Passwords match.' : 'Passwords do not match.', confirm.value === v ? 'success' : 'error');
      };

      password.addEventListener('input', refresh);
      confirm?.addEventListener('input', refresh);
      wrapper.querySelector('.password-generate')?.addEventListener('click', async () => {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
        const bytes = new Uint32Array(18);
        crypto.getRandomValues(bytes);
        let generated = Array.from(bytes, n => alphabet[n % alphabet.length]).join('');
        generated = `Sp!${generated}9aA`;
        password.type = 'text';
        if (confirm) confirm.type = 'text';
        password.value = generated;
        if (confirm) confirm.value = generated;
        refresh();
        try { await navigator.clipboard.writeText(generated); } catch (_) {}
        const btn = wrapper.querySelector('.password-generate');
        if (btn) {
          const old = btn.textContent;
          btn.textContent = 'Generated & copied';
          setTimeout(() => { btn.textContent = old; password.type = 'password'; if (confirm) confirm.type = 'password'; }, 2400);
        }
      });
    }
  });
})();
