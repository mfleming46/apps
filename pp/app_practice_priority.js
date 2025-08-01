// ver 0.7

$(document).ready(function() {

	let clearingLocalStorage = false; // for not saving when storage cleared
	let changeCount = 0;
	const changeThreshold = 0;   // <<<<<<<<<<<<<<<<<
	
	// Define a specific key for your app
    const storageKey = '_rc_practice_priority_table'; // Customize the key here
	
    const AGING_FACTOR = 0.9;
    let currentRowIndex = 0;
    let isPracticing = false;
	
	// log state flags at startup
	console.log('storageKey', storageKey);
	console.log('changeThreshold',changeThreshold);
	
	
	// Ensure the instructions are  hidden initially
    $('#instructions').hide(); // Hide second row on page load

    // Ensure the second row of buttons is hidden initially
    $('#controlPanel2').hide(); // Hide second row on page load

    // Enable or disable the first row of buttons based on practice mode
    function toggleFirstRowButtons(disable) {
        $('#controlPanel1 button').prop('disabled', disable);
    }

    // Show practice control panel and hide row 1 buttons
    function startPracticeCycle() {
		console.log('start practicing');
		logClick();
        toggleFirstRowButtons(true);
        $('#controlPanel2').show(); // Show second row of buttons
        isPracticing = true;
        currentRowIndex = 0;
        highlightCurrentRow();
    }

    // Stop practice cycle, hide practice buttons, show row 1 buttons, and auto sort
    function stopPracticeCycle() {
        toggleFirstRowButtons(false);
        $('#controlPanel2').hide(); // Hide second row of buttons
        isPracticing = false;
        $('#practiceTable tbody tr').removeClass('highlighted');
        recalculateAgedGrades();
        sortTableByAgedGrade(); // Automatically sort at the end of practice
		periodicAutoSave(999,'stopPracticeCycle');
    }

	// Clear button logic to delete all rows from the table
	$('#clearTable').on('click', function() {
		console.log('clearTable click');
		// Clear all rows in the tbody of the practice table
		$('#practiceTable tbody').empty();
		periodicAutoSave(999,'delete all rows click');
	});

    // Load a JSON file and populate the table
    $('#load').on('click', function() {
		console.log('Load JSON click');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = JSON.parse(e.target.result);
                populateTable(data);
                recalculateAgedGrades();
                sortTableByAgedGrade(); // Automatically sort after loading
				periodicAutoSave(999,'load JSON click');
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // Save table data to a JSON file
    $('#save').on('click', function() {
		console.log('save JSON click');
        const data = tableToJSON();
        const fileName = prompt('Enter file name to save (e.g., data.json):');
        if (fileName) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        }
    });

    // Add a new blank row at the top to preserve sort order
    $('#addRow').on('click', function() {
		console.log('addRow click');
        addRowAtTop();
        //sortTableByAgedGrade(); // Automatically sort after adding a new row
		periodicAutoSave(1, 'addRow click');
    });
	
    // Function to delete the selected row
    function deleteSelectedRow() {
        const selectedRow = $('#practiceTable tbody input[type="radio"]:checked').closest('tr');

        if (selectedRow.length === 0) {
            alert('No row is selected. Please select a row first.');
            return;
        }

        selectedRow.remove(); // Delete the selected row

        // Check if there are remaining rows, if so, select the first row
        const remainingRows = $('#practiceTable tbody tr');
        if (remainingRows.length > 0) {
            remainingRows.first().find('input[type="radio"]').prop('checked', true); // Select the first row
        }
    }	

    // Start Practice cycle
    $('#startPractice').on('click', function() {
        const rowCount = $('#practiceTable tbody tr').length;
        if (rowCount === 0) {
            alert('The table is empty. You need to add some rows before starting practice.');
            return;
        }
        startPracticeCycle();
    });

    // Stop Practice cycle
    $('#stop').on('click', function() {
        stopPracticeCycle();
    });

    // Grade buttons logic
    $('#grade1').on('click', () => applyGrade(1));
    $('#grade2').on('click', () => applyGrade(2));
    $('#grade3').on('click', () => applyGrade(3));
    $('#skip').on('click', nextRow);

    // Delete selected row
    $('#deleteRow').on('click', function() {
		console.log('deleteRow click');
		deleteSelectedRow();
		periodicAutoSave(1, 'deleteRow click');			
    });

    // Sample data, including the new row for "bar 33-64"
    const sampleData = [
        { item: 'bar 1-8', lastPracticed: getPastDate(2), grade: 3 },
        { item: 'bar 9-16', lastPracticed: getPastDate(1), grade: 2 },
        { item: 'bar 17-24', lastPracticed: getPastDate(0), grade: 1 },
        { item: 'bar 25-32', lastPracticed: getPastDate(0), grade: 2 },
        { item: 'bar 33-64', lastPracticed: getPastDate(40), grade: 3 } // New sample row
    ];

    // Utility function to get a past date (relative to today)
    function getPastDate(daysAgo) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0]; // Return in yyyy-mm-dd format
    }

    //# Add row at the top functionality
    function addRowAtTop(item = '', lastPracticed = '', grade = '') {
        const row = `<tr>
            <td><input type="radio" name="selectRow"></td>
            <td contenteditable="true">${item}</td>
            <td>${lastPracticed}</td>
            <td></td> <!-- Status column to be filled later -->
            <td>${grade}</td>
            <td></td>
        </tr>`;
        $('#practiceTable tbody').prepend(row); // Add row to the top of the table
		addBlurListenersToEditableCells(); // Reapply blur listeners to new cells
		clearingLocalStorage = false;
    }

    //# Populate the table from JSON or sample data
    function populateTable(data) {
        $('#practiceTable tbody').empty();
        data.forEach(row => addRowAtTop(row.item, row.lastPracticed, row.grade));
		recalculateAgedGrades();
    }

    // Convert table data to JSON
    function tableToJSON() {
        const data = [];
        $('#practiceTable tbody tr').each(function() {
            const item = $(this).find('td:eq(1)').text();
            const lastPracticed = $(this).find('td:eq(2)').text();
            const grade = $(this).find('td:eq(4)').text();
            data.push({ item, lastPracticed, grade });
        });
        return data;
    }

    // Calculate Status (Today, Yesterday, or days ago) and Aged Grade
    function recalculateAgedGrades() {
        $('#practiceTable tbody tr').each(function() {
            const lastPracticed = $(this).find('td:eq(2)').text();
            const grade = parseFloat($(this).find('td:eq(4)').text()) || 0;
            const agedGradeCell = $(this).find('td:eq(5)');
            const statusCell = $(this).find('td:eq(3)'); // Status column

            if (lastPracticed) {
                const lastPracticedDate = new Date(lastPracticed);
                const today = new Date();
                const delta = Math.floor((today - lastPracticedDate) / (1000 * 60 * 60 * 24));

                // Calculate and display the status
                if (delta === 0) {
                    statusCell.text('Today');
                } else if (delta === 1) {
                    statusCell.text('Yesterday');
                } else if (delta <= 30) {
                    statusCell.text(`${delta} days ago`); // Use "days ago"
                } else {
                    statusCell.text('>30 days ago');
                }

                // Calculate and display Aged Grade
                if (grade) {
                    const multiplier = Math.pow(AGING_FACTOR, delta);
                    const agedGrade = grade * multiplier;
                    agedGradeCell.text(agedGrade.toFixed(2));
                } else {
                    agedGradeCell.text(''); // Blank if no grade or no last practiced date
                }
            } else {
                statusCell.text(''); // Blank if no last practiced date
            }
        });
    }

	function sortTableByAgedGrade(shouldSort = true) {
		if (!shouldSort) return; // Skip sorting if the flag is false

		const rows = $('#practiceTable tbody tr').get(); // Get rows as an array
		rows.sort((a, b) => {
			const aVal = parseFloat($(a).find('td:eq(5)').text()) || NaN;
			const bVal = parseFloat($(b).find('td:eq(5)').text()) || NaN;

			// Blanks should go first
			if (isNaN(aVal)) return -1;
			if (isNaN(bVal)) return 1;

			// Sort in ascending order for non-blanks
			return aVal - bVal;
		});
    
		// Clear the table body and append sorted rows
		$('#practiceTable tbody').empty();
		$.each(rows, function(index, row) {
			$('#practiceTable tbody').append(row); // Append sorted rows back
		});

		// Reset the current row index to the first row after sorting
		currentRowIndex = 0; 
		highlightCurrentRow(); // Highlight the first row after sorting

		console.log('Table sorted, currentRowIndex reset to 0');
	}

    // Grade application and advancing rows
    function applyGrade(grade) {
        const row = $('#practiceTable tbody tr').eq(currentRowIndex);
        const today = new Date().toISOString().split('T')[0]; // Current date in yyyy-mm-dd
        row.find('td:eq(2)').text(today); // Set today's date
        row.find('td:eq(4)').text(grade); // Set grade
        recalculateAgedGrades(); // Recalculate aged grades and status
        //sortTableByAgedGrade(); // Automatically sort after grading
        nextRow();
    }

    // Highlight the current row and move to the next one
    function highlightCurrentRow() {
        // Clear all highlights
        $('#practiceTable tbody tr').removeClass('highlighted');
        // Select the current row
        const currentRow = $('#practiceTable tbody tr').eq(currentRowIndex);
        currentRow.addClass('highlighted');
        currentRow.find('input[type="radio"]').prop('checked', true);
    }

    // Allow user to change current row during practice by clicking radio button
    $('#practiceTable').on('change', 'input[type="radio"]', function() {
        const selectedIndex = $(this).closest('tr').index();
        currentRowIndex = selectedIndex;
        highlightCurrentRow(); // Reset the active item to the clicked row
    });

    function nextRow() {
        currentRowIndex++;
        if (currentRowIndex >= $('#practiceTable tbody tr').length) {
            stopPracticeCycle();
        } else {
            highlightCurrentRow();
        }
    }
	
    // Function to save table data to localStorage
    function saveTableToLocalStorage() {
    changeCount = 0;
    if (clearingLocalStorage) return;

    const tableData = [];
    $('#practiceTable tbody tr').each(function() {
        const row = $(this);
        const rowData = {
            item: row.find('td:eq(1)').text(),
            lastPracticed: row.find('td:eq(2)').text(),
            grade: row.find('td:eq(4)').text()
        };
        tableData.push(rowData);
    });

    SafeStorage.setItem(storageKey, tableData);
    console.log('Table data saved to storage', tableData);
}

    // Function to load table data from localStorage
    function loadTableFromLocalStorage() {
    changeCount = 0;

    const tableData = SafeStorage.getItem(storageKey);

    if (tableData && Array.isArray(tableData)) {
        populateTable(tableData);
        console.log('Table data loaded from storage');
    } else {
        console.log('No data found in storage, loading sample data');
        loadSampleData();
        sortTableByAgedGrade();
    }
}


    // Function to load sample data
    function loadSampleData() {
        populateTable(sampleData); // Use the sampleData array
		recalculateAgedGrades();
		sortTableByAgedGrade();
		periodicAutoSave(999,'loadSampleData');
    }
	
	// Click Handlers ---------------------------------------------------------------

	// Function to toggle admin-only buttons visibility
	$('#adminCheckbox').on('change', function() {
		console.log('admin toggled');
		if ($(this).is(':checked')) {
			$('.admin-only').show(); // Show admin-only buttons
		} else {
			$('.admin-only').hide(); // Hide admin-only buttons
		}
	});

    // Load data from localStorage or load sample data on startup
    loadTableFromLocalStorage();

    // Save table data to localStorage when the page is unloaded (e.g., when closing the browser or navigating away)
    $(window).on('beforeunload', function() {
        saveTableToLocalStorage();
    });

    // Extra button to load sample data
    $('#loadSampleData').on('click', function() {
		console.log('loadSampleData.on(click)');
        loadSampleData(); // Load sample data when this button is clicked
    });
	
$('#clearLocalStorage').on('click', function() {
    SafeStorage.removeItem(storageKey);
    $('#practiceTable tbody').empty();
    clearingLocalStorage = true;
    console.log('Storage cleared');
});
	
	
	// Listeners -------------------------------------------------------------

	// save to local storage when changecount exceeds threshhold
	function periodicAutoSave(delta=0, msg=None) {
		changeCount += delta;
		console.log('periodicAutoSave', changeCount, msg);
		if (changeCount>changeThreshold) {
			saveTableToLocalStorage();
		}
	}
	
	// Collapsible functionality for the instruction panel
    document.querySelector('.collapsible').addEventListener('click', function() {
        this.classList.toggle('active');
        var content = this.nextElementSibling;
        if (content.style.display === 'block') {
            content.style.display = 'none';
        } else {
            content.style.display = 'block';
        }
    });
	
	// -------------------------------------------------
	// Detect when the user changes an item name 
	function addBlurListenersToEditableCells() {
		const editableCells = document.querySelectorAll('#practiceTable tbody td[contenteditable="true"]');
		console.log('addBlurListeners', editableCells)
		editableCells.forEach(cell => {
			let originalValue = ''; // Variable to store the initial value

			// Store the original value when the cell gains focus
			cell.addEventListener('focus', function() {
				originalValue = cell.innerText;
			});

			// Check if the value has changed when the cell loses focus
			cell.addEventListener('blur', function() {
				if (cell.innerText !== originalValue) {
					//console.log('Item name changed to:', cell.innerText);
					periodicAutoSave(1, 'name changed to ' + cell.innerText);
					
				}
			});
		});
	}


});


function logClick() {
  fetch('../log.php?page=practice_priority', { method: 'GET' })
}