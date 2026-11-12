// Client-side form validation using regular expressions.
export const PATTERNS = {
  name: /^[A-Za-z][A-Za-z .'-]{1,49}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^$|^\+?[0-9][0-9\s-]{6,14}$/,       // optional field
  message: /^[\s\S]{10,500}$/,
};

const MESSAGES = {
  name: "Enter a valid name (2–50 letters).",
  email: "Enter a valid email address.",
  phone: "Enter a valid phone number (7–15 digits).",
  message: "Message must be between 10 and 500 characters.",
};

export function checkRegexPattern(value, pattern) {
  return pattern.test(value.trim());
}

function setState(input, valid) {
  const field = input.closest(".field");
  const errorEl = document.getElementById(`${input.name}-error`);
  field.classList.toggle("invalid", !valid);
  field.classList.toggle("valid", valid && input.value.trim() !== "");
  input.setAttribute("aria-invalid", String(!valid));
  if (errorEl) errorEl.textContent = valid ? "" : MESSAGES[input.name];
}

export function validateField(input) {
  const pattern = PATTERNS[input.name];
  if (!pattern) return true;
  const valid = checkRegexPattern(input.value, pattern);
  setState(input, valid);
  return valid;
}

// Handler for submit; returns true when the whole form is valid.
export function validateForm(e) {
  const form = e.target;
  const inputs = [...form.querySelectorAll("input[name], textarea[name]")];
  const results = inputs.map(validateField);
  const allValid = results.every(Boolean);
  if (!allValid) {
    e.preventDefault();
    inputs[results.indexOf(false)].focus();
  }
  return allValid;
}

// Wires up blur validation on every field.
export function initValidation(form) {
  form.querySelectorAll("input[name], textarea[name]").forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validateField(input);
    });
  });
}
