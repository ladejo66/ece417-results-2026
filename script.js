// ECE417 Results — Windows 2000 Style UI Logic

document.addEventListener('DOMContentLoaded', () => {
    const matricInput   = document.getElementById('matricInput');
    const submitButton  = document.getElementById('submitButton');
    const clearButton   = document.getElementById('clearButton');
    const outputDiv     = document.getElementById('output');
    const resultsContent = document.getElementById('resultsContent');
    const statusText    = document.getElementById('statusText');
    const statusPane    = document.getElementById('statusPane');
    const clockEl       = document.getElementById('clock');
    const datePane      = document.getElementById('datePane');

    // --- Clock & Date ---
    function updateClock() {
        const now = new Date();
        let h = now.getHours(), m = now.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        const mm = String(m).padStart(2, '0');
        clockEl.textContent = `${h}:${mm} ${ampm}`;

        const day   = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year  = now.getFullYear();
        datePane.textContent = `${day}/${month}/${year}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // --- Title bar button effects (decorative) ---
    document.querySelector('.minimize-btn')?.addEventListener('click', () => {
        setStatus('Window minimized.');
    });
    document.querySelector('.close-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to close the ECE417 Results Portal?')) {
            document.querySelector('.window').style.display = 'none';
        }
    });

    // --- Clear button ---
    clearButton.addEventListener('click', () => {
        matricInput.value = '';
        outputDiv.classList.add('hidden');
        resultsContent.innerHTML = '';
        setStatus('Ready. Enter your Matric Number above.');
        statusPane.textContent = 'Ready';
        matricInput.focus();
    });

    // --- Enter key support ---
    matricInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitButton.click();
    });

    // --- Set status helpers ---
    function setStatus(msg) {
        statusText.textContent = msg;
    }

    // --- Fetch Results ---
    submitButton.addEventListener('click', async () => {
        const matricNo = matricInput.value.trim();

        if (!matricNo) {
            setStatus('⚠ Please enter a valid Matric Number.');
            statusPane.textContent = 'Input Required';
            matricInput.focus();
            return;
        }

        // Show loading state
        setStatus('🔄 Connecting to server...');
        statusPane.textContent = 'Loading...';
        outputDiv.classList.remove('hidden');
        resultsContent.innerHTML = '<span class="loading-text">Please wait — fetching results from server...</span>';

        try {
            const response = await fetch(`https://ece417-2026-b-end.onrender.com/result/${encodeURIComponent(matricNo)}`);

            if (response.ok) {
                const result = await response.json();

                setStatus(`✔ Results found for ${result['Matric No']}.`);
                statusPane.textContent = 'Done';

                resultsContent.innerHTML = `
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Matric Number</td>
                                <td>${escapeHtml(String(result['Matric No']))}</td>
                            </tr>
                            <tr>
                                <td>Full Name</td>
                                <td>${escapeHtml(String(result['Name']))}</td>
                            </tr>
                            <tr class="score-row">
                                <td>CA Score (CA/30)</td>
                                <td>${escapeHtml(String(result['CA/30']))}</td>
                            </tr>
                            <tr class="score-row">
                                <td>Exam Score (Exam/70)</td>
                                <td>${escapeHtml(String(result['Exam/70']))}</td>
                            </tr>
                            <tr class="score-row">
                                <td><strong>Total Score (Total/100)</strong></td>
                                <td><strong>${escapeHtml(String(result['Total/100']))}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                `;
            } else {
                setStatus('✗ Matric Number not found.');
                statusPane.textContent = 'Not Found';
                resultsContent.innerHTML = '<span class="error-text">✗ Matric Number not found. Please verify and try again.</span>';
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            setStatus('✗ Network error. Please try again.');
            statusPane.textContent = 'Error';
            resultsContent.innerHTML = '<span class="error-text">✗ An error occurred while connecting to the server. Please check your connection and try again.</span>';
        }
    });

    // --- HTML escape helper ---
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
});
