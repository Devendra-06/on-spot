const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/v1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'secret';

async function reproduce() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/email/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });
        const { token } = await loginRes.json();

        console.log('Uploading test file...');
        // Create a dummy image file
        const filePath = path.join(__dirname, 'test.png');
        fs.writeFileSync(filePath, 'dummy content');

        const formData = new FormData();
        const fileContent = fs.readFileSync(filePath);
        const blob = new Blob([fileContent], { type: 'image/png' });
        formData.append('file', blob, 'test.png');

        const uploadRes = await fetch(`${API_URL}/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: No Content-Type header here for fetch + FormData
            },
            body: formData
        });

        const uploadData = await uploadRes.json();
        console.log('Response Status:', uploadRes.status);
        console.log('Response Body:', JSON.stringify(uploadData, null, 2));

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

reproduce();
