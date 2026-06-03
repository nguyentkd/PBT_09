const form = document.querySelector("#registerForm");
const nameInput = document.querySelector("#nameInput");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const confirmInput = document.querySelector("#confirmInput");
const phoneInput = document.querySelector("#phoneInput");
const submitBtn = document.querySelector("#submitBtn");
const modal = document.querySelector("#successModal");
const successBody = document.querySelector("#successBody");

const fields = {
    name: { valid: false },
    email: { valid: false },
    password: { valid: false, strength: "weak" },
    confirm: { valid: false },
    phone: { valid: false },
};

function setMessage(element, message, type = "") {
    element.textContent = message;
    element.className = `message${type ? ` ${type}` : ""}`;
}

function setStatus(element, valid) {
    element.textContent = valid ? "✅" : "❌";
    element.style.color = valid ? "var(--good)" : "var(--bad)";
}

function validateName() {
    const value = nameInput.value.trim();
    const valid = value.length >= 2 && value.length <= 50;
    fields.name.valid = valid;
    setStatus(document.querySelector("#nameStatus"), valid);
    setMessage(document.querySelector("#nameMessage"), valid ? "Tên hợp lệ" : "Tên phải từ 2 đến 50 ký tự", valid ? "success" : "error");
    updateSubmitState();
}

function validateEmail() {
    const value = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    fields.email.valid = valid;
    setStatus(document.querySelector("#emailStatus"), valid);
    setMessage(document.querySelector("#emailMessage"), valid ? "Email hợp lệ" : "Email không đúng định dạng", valid ? "success" : "error");
    updateSubmitState();
}

function getPasswordStrength(value) {
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    if (value.length < 8) {
        return { label: "Yếu", level: 1, color: "var(--bad)", valid: false };
    }

    if (hasLetter && hasNumber && hasUpper && hasLower && hasSpecial) {
        return { label: "Mạnh", level: 3, color: "var(--good)", valid: true };
    }

    if (hasLetter && hasNumber) {
        return { label: "Trung bình", level: 2, color: "var(--warn)", valid: true };
    }

    return { label: "Yếu", level: 1, color: "var(--bad)", valid: false };
}

function validatePassword() {
    const value = passwordInput.value;
    const strength = getPasswordStrength(value);
    fields.password.valid = strength.valid;
    fields.password.strength = strength.label.toLowerCase();

    const bar = document.querySelector("#passwordBar");
    bar.style.width = `${(strength.level / 3) * 100}%`;
    bar.style.background = strength.color;
    setStatus(document.querySelector("#passwordStatus"), strength.valid);
    setMessage(document.querySelector("#passwordMessage"), `Độ mạnh: ${strength.label}`, strength.valid ? "success" : "error");
    validateConfirm();
    updateSubmitState();
}

function validateConfirm() {
    const valid = confirmInput.value.length > 0 && confirmInput.value === passwordInput.value;
    fields.confirm.valid = valid;
    setStatus(document.querySelector("#confirmStatus"), valid);
    setMessage(document.querySelector("#confirmMessage"), valid ? "Khớp password" : "Password xác nhận chưa khớp", valid ? "success" : "error");
    updateSubmitState();
}

function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    const parts = [];

    if (digits.length <= 4) {
        return digits;
    }

    parts.push(digits.slice(0, 4));
    if (digits.length <= 7) {
        parts.push(digits.slice(4));
        return parts.join("-");
    }

    parts.push(digits.slice(4, 7));
    parts.push(digits.slice(7));
    return parts.join("-");
}

function validatePhone() {
    const digits = phoneInput.value.replace(/\D/g, "");
    const valid = digits.length === 10;
    fields.phone.valid = valid;
    setStatus(document.querySelector("#phoneStatus"), valid);
    setMessage(document.querySelector("#phoneMessage"), valid ? "Số điện thoại hợp lệ" : "Phone phải đủ 10 chữ số", valid ? "success" : "error");
    updateSubmitState();
}

function updateSubmitState() {
    submitBtn.disabled = !Object.values(fields).every(field => field.valid);
}

nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);
confirmInput.addEventListener("input", validateConfirm);
phoneInput.addEventListener("input", event => {
    const formatted = formatPhone(event.target.value);
    phoneInput.value = formatted;
    validatePhone();
});

form.addEventListener("submit", event => {
    event.preventDefault();
    if (submitBtn.disabled) return;

    const data = [
        ["Tên", nameInput.value.trim()],
        ["Email", emailInput.value.trim()],
        ["Phone", phoneInput.value.trim()],
    ];

    successBody.textContent = "";
    data.forEach(([label, value]) => {
        const row = document.createElement("p");
        row.textContent = `${label}: ${value}`;
        successBody.appendChild(row);
    });

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    const close = document.querySelector("#closeModal");
    if (close) close.focus();
});

document.querySelector("#closeModal").addEventListener("click", () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    submitBtn.focus();
});

modal.addEventListener("click", event => {
    if (event.target === modal) {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
    }
});

validateName();
validateEmail();
validatePassword();
validateConfirm();
validatePhone();
