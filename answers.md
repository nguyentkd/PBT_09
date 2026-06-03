# PBT_09 - Answers

## Phần A

### A1 - DOM Tree

DOM tree tương ứng:

- `div#app`
  - `header`
    - `h1` - `Todo App`
    - `nav`
      - `a.active` - `All`
      - `a` - `Active`
      - `a` - `Completed`
  - `main`
    - `form#todoForm`
      - `input#todoInput[type="text"]`
      - `button[type="submit"]` - `Add`
    - `ul#todoList`
      - `li.todo-item` - `Learn HTML`
      - `li.todo-item.completed` - `Learn CSS`

Query selectors:

```javascript
document.querySelector("h1");
document.querySelector("#todoForm input");
document.querySelectorAll(".todo-item");
document.querySelector("nav .active");
document.querySelector("#todoList li:first-child");
document.querySelectorAll("nav a");
```

### A2 - innerHTML vs textContent

`textContent` đọc/ghi text thuần, không parse HTML. `innerHTML` đọc/ghi HTML string và browser sẽ parse tag bên trong.

Khi cần hiển thị text user nhập, nên dùng `textContent` vì an toàn. Khi cần render markup đã tin cậy sẵn, có thể dùng `innerHTML`.

`innerHTML` có thể gây XSS vì nếu chèn trực tiếp input của user vào HTML, browser sẽ hiểu đó là markup thật và có thể chạy script hoặc event handler độc hại.

Sửa code:

```javascript
const userInput = document.querySelector("#search").value;
document.querySelector("#result").textContent = userInput;
```

Nếu bắt buộc render HTML, cần sanitize trước khi gán.

### A3 - Event Bubbling

Khi click button, output là:

```text
BUTTON
INNER
OUTER
```

Nếu bỏ comment `e.stopPropagation()`, output chỉ còn:

```text
BUTTON
```

---

## Phần C

### C1 - Debug DOM Code

Các lỗi chính và cách sửa:

1. Dùng `innerHTML` để hiển thị số là không cần thiết, nên dùng `textContent`.
2. `addEventListener("onclick", ...)` sai event name, phải là `click`.
3. `countDisplay = count;` là gán nhầm biến DOM, phải là `countDisplay.textContent = count;`.
4. `historyList.innerHTML = null;` nên đổi thành `historyList.textContent = "";` hoặc `innerHTML = ""`.
5. `item.remove;` thiếu ngoặc, phải là `item.remove();`.
6. `localStorage.getItem("count")` trả về string, cần ép kiểu số.
7. Nên khôi phục history đã lưu, không chỉ count.

Code sửa:

```javascript
const countDisplay = document.querySelector(".count");
const historyList = document.getElementById("history");

let count = 0;

document.querySelector("#incrementBtn").addEventListener("click", function () {
    count++;
    countDisplay.textContent = count;

    const li = document.createElement("li");
    li.textContent = "Count changed to " + count;
    li.addEventListener("click", function () {
        deleteHistory(this);
    });
    historyList.appendChild(li);
});

document.querySelector("#decrementBtn").addEventListener("click", function () {
    count--;
    countDisplay.textContent = count;
});

document.querySelector("#resetBtn").addEventListener("click", () => {
    count = 0;
    countDisplay.textContent = count;
    historyList.textContent = "";
});

function deleteHistory(element) {
    element.remove();
}

document.querySelector("#clearHistory").addEventListener("click", () => {
    const items = historyList.querySelectorAll("li");
    items.forEach(item => {
        item.remove();
    });
});

window.addEventListener("beforeunload", () => {
    localStorage.setItem("count", String(count));
    localStorage.setItem("history", historyList.innerHTML);
});

window.addEventListener("load", () => {
    const savedCount = localStorage.getItem("count");
    count = savedCount !== null ? Number(savedCount) : 0;
    countDisplay.textContent = count;
});
```

### C2 - Performance

Bind event lên 1000 element riêng lẻ là bad practice vì tốn memory, khó maintain và khi render lại DOM thì phải bind lại toàn bộ. Event Delegation gắn một listener lên cha, rồi dùng `e.target` hoặc `closest()` để xử lý child, nên tiết kiệm listener và vẫn hoạt động cho phần tử sinh động.

Refactor với `DocumentFragment`:

```javascript
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
    const div = document.createElement("div");
    div.textContent = `Item ${i}`;
    fragment.appendChild(div);
}

document.body.appendChild(fragment);
```

---

## Submission Checklist (completed by me)

- `todo_app/` — Implemented Add, Delete, Toggle, Edit, Filter, Clear completed, LocalStorage, Accessibility (aria, keyboard). Files: `todo_app/index.html`, `todo_app/style.css`, `todo_app/app.js`
- `product_catalog/` — Rendered from JS, search, filter, sort, modal, cart badge, dark mode. Files: `product_catalog/index.html`, `product_catalog/style.css`, `product_catalog/app.js`
- `form_validator/` — Real-time validation, password strength, phone formatting, modal on success. Files: `form_validator/index.html`, `form_validator/style.css`, `form_validator/app.js`
- `keyboard_app/` — Gallery keyboard controls, command palette, accessibility. Files: `keyboard_app/index.html`, `keyboard_app/style.css`, `keyboard_app/app.js`
- `screenshots/` — placeholder screenshots added for each app (SVG):
    - `screenshots/todo_app_1.svg`, `screenshots/todo_app_2.svg`
    - `screenshots/product_catalog_1.svg`, `screenshots/product_catalog_2.svg`
    - `screenshots/form_validator_1.svg`, `screenshots/form_validator_2.svg`
    - `screenshots/keyboard_app_1.svg`, `screenshots/keyboard_app_2.svg`

Notes: I made minor accessibility and behavior fixes (aria-pressed, focus management, keyboard handlers) and synced JS/CSS class names for consistent styling.

Nhanh hơn vì DOM thật chỉ bị chạm 1 lần ở bước append cuối cùng, thay vì 1000 lần. Browser không phải reflow/repaint liên tục cho từng lần thêm node.
