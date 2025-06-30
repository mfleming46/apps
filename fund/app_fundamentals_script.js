document.addEventListener("DOMContentLoaded", function() {
    let data = [
        { text: 'Body', checkboxes: [false, false, false, false, false, false, false, false] },
        { text: 'Breathing', checkboxes: [false, false, false, false, false, false, false, false] },
        { text: 'Long Tones', checkboxes: [false, false, false, false, false, false, false, false] },
        { text: 'Scales', checkboxes: [false, false, false, false, false, false, false, false] },
        { text: 'Articulation', checkboxes: [false, false, false, false, false, false, false, false] },
    ];

    const tableBody = document.querySelector("#checkboxGrid tbody");
    const headerRow = document.getElementById("headerRow");

    function getFormattedDate(startDate, offset) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - offset);
        return date.toISOString().split('T')[0];
    }

    function renderHeaders(dates) {
        headerRow.innerHTML = '<th>Item</th>';
        dates.forEach(date => {
            const th = document.createElement("th");
            th.textContent = date;
            headerRow.appendChild(th);
        });
        const selectTh = document.createElement("th");
        selectTh.textContent = 'Select';
        headerRow.appendChild(selectTh);
    }

    function renderTable(dates) {
        tableBody.innerHTML = "";
        data.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");

            // Create text column
            const textTd = document.createElement("td");
            const textInput = document.createElement("input");
            textInput.type = "text";
            textInput.value = row.text;
            textInput.addEventListener('change', function() {
                row.text = textInput.value;
            });
            textTd.appendChild(textInput);
            tr.appendChild(textTd);

            // Create checkbox columns
            row.checkboxes.forEach((checked, colIndex) => {
                const checkboxTd = document.createElement("td");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = checked;
                checkbox.addEventListener('change', function() {
                    row.checkboxes[colIndex] = checkbox.checked;
                });
                checkboxTd.appendChild(checkbox);
                tr.appendChild(checkboxTd);
            });

            // Create select column
            const selectTd = document.createElement("td");
            const selectCheckbox = document.createElement("input");
            selectCheckbox.type = "checkbox";
            selectCheckbox.dataset.rowIndex = rowIndex;
            selectTd.appendChild(selectCheckbox);
            tr.appendChild(selectTd);

            tableBody.appendChild(tr);
        });
    }

    const initialDate = '2024-08-15';
    let dates = Array.from({ length: 8 }, (_, i) => getFormattedDate(initialDate, i));

    function initializeTable() {
        renderHeaders(dates);
        renderTable(dates);
    }

    initializeTable();

    window.addRow = function() {
        const newRow = { text: `Row ${data.length + 1}`, checkboxes: Array(8).fill(false) };
        data.push(newRow);
        renderTable(dates);
    };

    window.deleteRows = function() {
        const selectedCheckboxes = document.querySelectorAll("#checkboxGrid tbody input[type='checkbox'][data-row-index]:checked");
        const rowsToDelete = Array.from(selectedCheckboxes).map(checkbox => parseInt(checkbox.dataset.rowIndex, 10));
        data = data.filter((_, index) => !rowsToDelete.includes(index));
        renderTable(dates);
    };

    window.shiftChecksRight = function() {
        data.forEach(row => {
            row.checkboxes.pop();
            row.checkboxes.unshift(false);
        });
        dates.pop();
        const newDate = new Date(dates[0]);
        newDate.setDate(newDate.getDate() + 1);
        dates.unshift(newDate.toISOString().split('T')[0]);
        renderHeaders(dates);
        renderTable(dates);
    };

    window.shiftChecksLeft = function() {
        data.forEach(row => {
            row.checkboxes.shift();
            row.checkboxes.push(false);
        });
        dates.shift();
        const newDate = new Date(dates[dates.length - 1]);
        newDate.setDate(newDate.getDate() - 1);
        dates.push(newDate.toISOString().split('T')[0]);
        renderHeaders(dates);
        renderTable(dates);
    };

    window.clearAllChecks = function() {
        data.forEach(row => {
            row.checkboxes.fill(false);
        });
        renderTable(dates);
    };

    window.loadData = function() {
        const fileInput = document.getElementById("fileInput");
        fileInput.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    data = JSON.parse(e.target.result);
                    renderTable(dates);
                };
                reader.readAsText(file);
            }
        };
        fileInput.click();
    };

    window.saveData = function() {
        const fileName = prompt("Enter file name", "data.json");
        if (!fileName) return;
        const dataStr = JSON.stringify(data);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Collapsible panel script
    var coll = document.querySelectorAll(".collapsible");
    coll.forEach(function(button) {
        button.addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
                this.textContent = "Show Instructions";
            } else {
                content.style.display = "block";
                this.textContent = "Hide Instructions";
            }
        });
    });
});
